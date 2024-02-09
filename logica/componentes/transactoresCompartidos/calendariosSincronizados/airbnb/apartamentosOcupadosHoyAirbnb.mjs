import { conexion } from "../../../db.mjs"
import { sincronizarCalendariosAirbnbPorIDV } from "./sincronizarCalendariosAirbnbPorIDV.mjs"
import { verificarRangoContenidoAirbnb } from "./verificarRangoContenidoAirbnb.mjs"

const apartamentosOcupadosHoy = async (fechaHoy_ISO1) => {
    // Obtener todo los calendarios de airbnb que coinciden con hoy, o las fecha que se le pase. Este script es diferente a apartamentosOcupadosAirbnbn y por tanto estos dos script deben exsite y no son reutilizables.
    const plataformaOrigen = "airbnb"
    const consultaCalendariosSincronizados = `
    SELECT 
    "apartamentoIDV"
    FROM 
    "calendariosSincronizados"
    WHERE
    "plataformaOrigen" = $1;
    `
    const resuelveCalendariosSincronizados = await conexion.query(consultaCalendariosSincronizados, [plataformaOrigen])
    const apartamentosIDVArray = resuelveCalendariosSincronizados.rows


    const fechaHoy_ISO = "2024-05-05"
    // Sincronizar y obtener los dtos
    const eventosPorApartamento = []
    for (const apartamentoIDV_porCalendario of apartamentosIDVArray) {
        const apartamentoIDV_porComprovar = apartamentoIDV_porCalendario.apartamentoIDV
        const calendarioExterno = await sincronizarCalendariosAirbnbPorIDV(apartamentoIDV_porComprovar)
        const calendariosPorApartamento = calendarioExterno.calendariosPorApartamento
        const apartamentoIDV = calendarioExterno.apartamentoIDV

        const detallesDelApartamento = {
            apartametnoIDV: apartamentoIDV,
            eventos: []
        }


        for (const calendarioDelApartamento of calendariosPorApartamento) {
            const calendariosObjetoDelApartamento = calendarioDelApartamento.calendarioObjeto

            for (const detallesDelCalendario of calendariosObjetoDelApartamento) {
                const fechaInicioComparar = detallesDelCalendario.fechaInicio
                const fechaFinalComparar = detallesDelCalendario.fechaFinal
                //console.log("detallesEvento", detallesDelCalendario)
                const controlOcupacional = verificarRangoContenidoAirbnb(
                    fechaHoy_ISO,
                    fechaHoy_ISO,
                    fechaInicioComparar,
                    fechaFinalComparar
                )
                if (controlOcupacional === "ocupado") {
                    //apartamentosOcupados.push(apartamentoIDV)
                    detallesDelApartamento.eventos.push(detallesDelCalendario)

                }
            }
        }
        eventosPorApartamento.push(detallesDelApartamento)
    }


    console.log("final", eventosPorApartamento)
    return eventosPorApartamento




}
export {
    apartamentosOcupadosHoy
}