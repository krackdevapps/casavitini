import { DateTime } from "luxon";
import { selectorRangoUniversal } from "../selectoresCompartidos/selectorRangoUniversal.mjs";
import { validadoresCompartidos } from "../validadores/validadoresCompartidos.mjs";

export const selectorPorCondicion = async (data) => {
    try {
        const oferta = data.oferta
        const condiciones = oferta.condiciones
        const apartamentosArray = data.apartamentosArray
        const fechaActual_reserva = data.fechaActual
        const fechaEntrada_reserva = data.fechaEntrada
        const fechaSalida_reserva = data.fechaSalida

        const resultadoSelector = {
            condicionesQueSeCumplen: [],
            condicionesQueNoSeCumple: []
        }

        for (const condicion of condiciones) {
            const tipoCondicion = condicion.tipoCondicion
            const nombreOferta = oferta.nombreOferta
            if (tipoCondicion === "conFechaEntradaEntreRango") {
                const fechaInicioRango_ISO = condicion.fechaInicioRango_ISO
                const fechaFinalRango_ISO = condicion.fechaFinalRango_ISO

                const fechaInicioRango_objeto = DateTime.fromISO(fechaInicioRango_ISO)
                const fechaFinalRango_objeto = DateTime.fromISO(fechaFinalRango_ISO)
                const fechaActual_objeto = DateTime.fromISO(fechaActual_reserva)

                const fechaDentroDelRango = fechaActual_objeto >= fechaInicioRango_objeto && fechaActual_objeto <= fechaFinalRango_objeto;
                if (!fechaDentroDelRango) {
                    resultadoSelector.condicionesQueNoSeCumple.push(tipoCondicion)
                } else {
                    resultadoSelector.condicionesQueSeCumplen.push(tipoCondicion)
                }
            } else if (tipoCondicion === "conFechaCreacionEntreRango") {
                const fechaInicioOferta = condicion.fechaInicioOferta
                const fechaFinalOferata = condicion.fechaFinalOferta

                const fechaInicioOferta_objeto = DateTime.fromISO(fechaInicioOferta)
                const fechaFinalOferta_objeto = DateTime.fromISO(fechaFinalOferata)
                const fechaActual_objeto = DateTime.fromISO(fechaActual_reserva)

                const fechaDentroDelRango = fechaActual_objeto >= fechaInicioOferta_objeto && fechaActual_objeto <= fechaFinalOferta_objeto;
                if (!fechaDentroDelRango) {
                    resultadoSelector.condicionesQueNoSeCumple.push(tipoCondicion)
                } else {
                    resultadoSelector.condicionesQueSeCumplen.push(tipoCondicion)
                }

            } else if (tipoCondicion === "porNumeroDeApartamentos") {

                const numeroApartamentosReserva = apartamentosArray.lenght
                const numeroApartamentosOferta = condicion.numeroDeApartamentos
                const tipoConteo = condicion.tipoConteo

                if (tipoConteo === "numeroExacto") {
                    if (Number(numeroApartamentosOferta) === Number(numeroApartamentosReserva)) {
                        resultadoSelector.condicionesQueSeCumplen.push(tipoCondicion)
                    } else {
                        resultadoSelector.condicionesQueNoSeCumple.push(tipoCondicion)
                    }
                } else if (tipoConteo === "aPartirDe") {
                    if (Number(numeroApartamentosOferta) >= Number(numeroApartamentosReserva)) {
                        resultadoSelector.condicionesQueSeCumplen.push(tipoCondicion)
                    } else {
                        resultadoSelector.condicionesQueNoSeCumple.push(tipoCondicion)
                    }
                }
            } else if (tipoCondicion === "porDiasDeAntelacion") {
                const fechaActual_objeto = DateTime.fromISO(fechaActual_reserva)
                const fechaEntrada_objeto = DateTime.fromISO(fechaEntrada_reserva)
                const tipoConteo = condicion.tipoConteo
                const numeroDeDias = Number(condicion.numeroDeDias)

                const diasAntelacion = Math.floor(fechaEntrada_objeto.diff(fechaActual_objeto, 'days').days);
                if (tipoConteo === "aPartirDe" && numeroDeDias <= diasAntelacion) {
                    resultadoSelector.condicionesQueSeCumplen.push(tipoCondicion)
                } else {
                    resultadoSelector.condicionesQueNoSeCumple.push(tipoCondicion)
                }
                if (tipoConteo === "numeroExacto" && numeroDeDias === diasAntelacion) {
                    resultadoSelector.condicionesQueSeCumplen.push(tipoCondicion)

                } else {
                    resultadoSelector.condicionesQueNoSeCumple.push(tipoCondicion)
                }
            } else if (tipoCondicion === "porRangoDeFechas") {
                const fechaInicio_oferta = oferta.fechaInicio
                const fechaFinal_oferta = oferta.fechaFinal
                const rangoFechasReservaEnRangoFechaOferta = selectorRangoUniversal({
                    fechaInicio_rango_ISO: fechaInicio_oferta,
                    fechaFin_rango_ISO: fechaFinal_oferta,
                    fechaInicio_elemento_ISO: fechaEntrada_reserva,
                    fechaFin_elemento_ISO: fechaSalida_reserva,
                    tipoLimtie: "incluido"
                })
                if (rangoFechasReservaEnRangoFechaOferta) {
                    resultadoSelector.condicionesQueSeCumplen.push(tipoCondicion)
                } else {
                    resultadoSelector.condicionesQueNoSeCumple.push(tipoCondicion)
                }
            } else if (tipoCondicion === "porDiasDeReserva") {

                const fechaEntrada_objeto = DateTime.fromISO(fechaEntrada_reserva)
                const fechaSalida_objeto = DateTime.fromISO(fechaSalida_reserva)
                const tipoConteo = condicion.tipoConteo
                const numeroDias = condiciones.diasDeReserva
                const diasAntelacion = Math.floor(fechaEntrada_objeto.diff(fechaSalida_objeto, 'days').days);

                if (tipoConteo === "aPartirDe" && numeroDias <= diasAntelacion) {
                    resultadoSelector.condicionesQueSeCumplen.push(tipoCondicion)
                } else {
                    resultadoSelector.condicionesQueNoSeCumple.push(tipoCondicion)
                }
                if (tipoConteo === "numeroExacto" && numeroDias === diasAntelacion) {
                    resultadoSelector.condicionesQueSeCumplen.push(tipoCondicion)

                } else {
                    resultadoSelector.condicionesQueNoSeCumple.push(tipoCondicion)
                }
            } else if (tipoCondicion === "porApartamentosEspecificos") {
                const apartamentosDeLaReserva = apartamentosArray
                const apartamentosOferta = condicion.apartamentos
                const losArraysSonExactos = validadoresCompartidos.filtros.comparadorArraysExactos({
                    arrayPrimero: apartamentosDeLaReserva,
                    arraySegundo: apartamentosOferta
                })
                if (losArraysSonExactos) {
                    resultadoSelector.condicionesQueSeCumplen.push(tipoCondicion)
                } else {
                    resultadoSelector.condicionesQueNoSeCumple.push(tipoCondicion)
                }
            } else {
                const error = `En la oferta ${nombreOferta} no se reconoce el identificador de condicion ${tipoCondicion}`
                throw new Error(error)
            }
        }
        return resultadoSelector
    } catch (error) {
        throw error
    }
}
