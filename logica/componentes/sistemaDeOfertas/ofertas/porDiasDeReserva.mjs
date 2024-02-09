import { DateTime } from "luxon";
import Decimal from "decimal.js";
import { conexion } from "../../db.mjs";
import { validadoresCompartidos } from "../../validadoresCompartidos.mjs";

const porDiasDeReserva = async (reserva) => {
    try {

        const fechaEntradaReserva_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(reserva.fechas.entrada)).fecha_ISO
        const fechaSalidaReserva_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(reserva.fechas.salida)).fecha_ISO
        const totalReservaNeto = new Decimal(reserva.desgloseFinanciero.totales.totalReservaNeto)

        const fechaActualTZ =  reserva.fechas.fechaActualProcesada_ISO

        const estadoOfertaActivado = "activada"
        const consulta = `
        SELECT 
        uid,
        to_char("fechaInicio", 'DD/MM/YYYY') as "fechaInicio", 
        to_char("fechaFin", 'DD/MM/YYYY') as "fechaFin",
        "simboloNumero",
        "descuentoAplicadoA",
        "estadoOferta",
        "tipoOferta",
        "cantidad",
        numero,
        "tipoDescuento",
        "nombreOferta"
        FROM ofertas
        WHERE $1 BETWEEN "fechaInicio" AND "fechaFin"
        AND "estadoOferta" = $2
        AND "tipoOferta" = $3;`;
        // Mucho ojo en las ofertas de tipo1 por que se activan revisando la fecha actual, es decir la fecha de cuando se realiza la reserva y no las fechas de inicio y fin de la reserva, eso se revisa mas adelante
        // Acuerdate por que esta parte es un poco contraintuitiva.
        const ofertasTipo = "porDiasDeReserva";
        const ofertasEncontradas = await conexion.query(consulta, [fechaActualTZ, estadoOfertaActivado, ofertasTipo]);
        const ofertasSeleccionadas = []

        for (const detallesOferta of ofertasEncontradas.rows) {
            const simboloNumero = detallesOferta.simboloNumero
            const numero = detallesOferta.numero
            const nombreOferta = detallesOferta.nombreOferta
            const tipoDescuento = detallesOferta.tipoDescuento
            const cantidad = detallesOferta.cantidad
            const tipoOferta = detallesOferta.tipoOferta


            const ofertaEstructuraFinal = {
                nombreOferta: nombreOferta,
                tipoDescuento: tipoDescuento,
                cantidad: cantidad,
                numero: numero, 
                simboloNumero: simboloNumero,
                tipoOferta:tipoOferta
            }

            const fechaEntradaReservaObjeto = DateTime.fromISO(fechaEntradaReserva_ISO);
            const fechaSalidaReservaObjeto = DateTime.fromISO(fechaSalidaReserva_ISO);
            const diasDeLaReserva = Math.floor(fechaSalidaReservaObjeto.diff(fechaEntradaReservaObjeto, 'days').days);

            let descuentoUI
            if (tipoDescuento === "porcentaje") {
                descuentoUI = `del ${cantidad}%`
            }
            if (tipoDescuento === "cantidadFija") {
                descuentoUI = `de ${cantidad}$`
            }

            if (simboloNumero === "aPartirDe" && numero <= diasDeLaReserva) {
                ofertaEstructuraFinal.definicion = `Oferta aplicada a reserva con ${numero} dias de duración o mas.`
                ofertasSeleccionadas.push(ofertaEstructuraFinal)
            }
            if (simboloNumero === "numeroExacto" && numero === diasDeLaReserva) {
                ofertaEstructuraFinal.definicion = `Oferta aplicada a reserva con ${numero} dias de duración concretament.`
                ofertasSeleccionadas.push(ofertaEstructuraFinal)
            }

        }

        let descuentoGlobal = new Decimal("0.00")
        for (const detallesOferta of ofertasSeleccionadas) {
            const tipoDescuento = detallesOferta.tipoDescuento
            const cantidad = new Decimal(detallesOferta.cantidad)

            if (tipoDescuento === "cantidadFija") {
                descuentoGlobal = descuentoGlobal.plus(cantidad)
                detallesOferta.descuento = `${descuentoGlobal}`

            }
            if (tipoDescuento === "porcentaje") {
                descuentoGlobal = cantidad.dividedBy(100).times(totalReservaNeto)
                detallesOferta.descuento = `${descuentoGlobal}`
            }

        }

        const estructuraSaliente = {
            porDiasDeReserva: ofertasSeleccionadas,
            descuentoGlobal: descuentoGlobal
        }
        return estructuraSaliente

    } catch (error) {
        throw error
    }
}


export {
    porDiasDeReserva
}