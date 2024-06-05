import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../../../sistema/configuracion/codigoZonaHoraria.mjs";
import { configuracionApartamento } from "../../../sistema/configuracionApartamento.mjs";
import { interruptor } from "../../../sistema/configuracion/interruptor.mjs";
import { apartamentosPorRango } from "../../../sistema/selectoresCompartidos/apartamentosPorRango.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { eliminarBloqueoCaducado } from "../../../sistema/bloqueos/eliminarBloqueoCaducado.mjs";
import { mensajesUI } from "../../../componentes/mensajesUI.mjs";
import { procesadorPrecio } from "../../../sistema/precios/procesdadorPrecio.mjs";

export const apartamentosDisponiblesPublico = async (entrada, salida) => {
    try {
        if (!await interruptor("aceptarReservasPublicas")) {
            throw new Error(mensajesUI.aceptarReservasPublicas);
        }
        const fechaEntrada_ISO = (await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: entrada.body.fechaEntrada,
            nombreCampo: "La fecha de entrada en apartamentosDisponiblesPublico"
        }
        ))
        const fechaSalida_ISO = (await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: entrada.body.fechaSalida,
            nombreCampo: "La fecha de salida en apartametnosDisponbiblesPublico"
        }))
        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        const tiempoZH = DateTime.now().setZone(zonaHoraria);
        const fechaEntrad_objeto = DateTime.fromISO(fechaEntrada_ISO, { zone: zonaHoraria });
        if (fechaEntrad_objeto < tiempoZH.startOf('day')) {
            const error = "La fecha de entrada no puede ser inferior a la fecha actual. Solo se pueden hacer reservas a partir de hoy";
          // throw new Error(error);
        }

        await eliminarBloqueoCaducado();
        const rol = entrada.session.rol;
        const configuracionApartamentosPorRango = {
            fechaEntrada_ISO: fechaEntrada_ISO,
            fechaSalida_ISO: fechaSalida_ISO,
            rol: rol,
            origen: "plaza"
        };
        //const resuelveADP = await apartamentosDisponiblesPublico(fecha)
        const resuelveApartametnoDisponiblesPublico = await apartamentosPorRango(configuracionApartamentosPorRango);
        const apartamentosDisponiblesEncontrados = resuelveApartametnoDisponiblesPublico.apartamentosDisponibles;
        const configuracionesApartamentosVerificadas = await configuracionApartamento(apartamentosDisponiblesEncontrados);


        const estructuraFinal = {};
        const desgloseFinanciero = await procesadorPrecio({
            fechaEntrada: fechaEntrada_ISO,
            fechaSalida: fechaSalida_ISO,
            apartamentosArray: apartamentosDisponiblesEncontrados,
            capaOfertas: "si",
            zonasDeLaOferta: ["global", "publica"],
            capaImpuestos: "si",
            capaDescuentosPersonalizados: "si",
            descuentosArray: ["52", "50", "51","50","50"]
        })
        estructuraFinal.desgloseFinanciero = desgloseFinanciero
        estructuraFinal.apartamentosDisponibles = configuracionesApartamentosVerificadas.configuracionApartamento;
        const ok = {
            ok: estructuraFinal
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}