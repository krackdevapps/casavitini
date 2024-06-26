import { DateTime } from "luxon";
import { validadoresCompartidos } from "../../validadores/validadoresCompartidos.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { obtenerReservasDeTodosLosApartamentosPorMesPorAno } from "../../../repositorio/reservas/selectoresDeReservas/obtenerReservasDeTodosLosApartamentosPorMesPorAno.mjs";

export const eventosTodosLosApartamentos = async (fecha) => {
    try {
        validadoresCompartidos.fechas.fechaMesAno(fecha)
        const fechaArray = fecha.split("-")
        const mes = fechaArray[0]
        const ano = fechaArray[1]
        const fechaObjeto = DateTime.fromObject({ year: ano, month: mes, day: 1 });
        const numeroDeDiasDelMes = fechaObjeto.daysInMonth;
        const calendarioObjeto = {}
        for (let numeroDia = 1; numeroDia <= numeroDeDiasDelMes; numeroDia++) {
            const llaveCalendarioObjeto = `${ano}-${mes}-${numeroDia}`
            calendarioObjeto[llaveCalendarioObjeto] = []
        }
        const obtenerFechasInternas = (fechaInicio_ISO, fechaFin_ISO) => {
            const inicio = DateTime.fromISO(fechaInicio_ISO);
            const fin = DateTime.fromISO(fechaFin_ISO);
            const fechasInternas = [];
            for (let i = 0; i <= fin.diff(inicio, "days").days; i++) {
                const fechaActual = inicio.plus({ days: i });
                fechasInternas.push(fechaActual.toISODate());
            }
            return fechasInternas;
        }
        const reservaCancelada = "cancelada"
        const reservas = await obtenerReservasDeTodosLosApartamentosPorMesPorAno({
            mes: mes,
            ano: ano,
            reservaCancelada: reservaCancelada
        })
        const reservasSelecciondas = []

        for (const detalles of reservas) {
            const apartamentoIDV = detalles.apartamentoIDV
            detalles.apartamentoUI = await obtenerApartamentoComoEntidadPorApartamentoIDV(apartamentoIDV)
            reservasSelecciondas.push(detalles)
        }
        for (const detallesReserva of reservasSelecciondas) {
            const reservaUID = detallesReserva.reserva
            const apartamentoUID = detallesReserva.uid
            const fechaEntrada_ISO = detallesReserva.fechaEntrada_ISO
            const fechaSalida_ISO = detallesReserva.fechaSalida_ISO
            const apartamentoIDVReserva = detallesReserva.apartamentoIDV
            detallesReserva.duracion_en_dias = detallesReserva.duracion_en_dias + 1
            detallesReserva.tipoEvento = "todosLosApartamentos"
            detallesReserva.eventoUID = "todosLosApartamentos_" + apartamentoUID
            const arrayConFechasInternas = obtenerFechasInternas(fechaEntrada_ISO, fechaSalida_ISO)
            for (const fechaInterna_ISO of arrayConFechasInternas) {
                const fechaInternaObjeto = DateTime.fromISO(fechaInterna_ISO)
                const diaFechaInterna = fechaInternaObjeto.day
                const mesFechaInterna = fechaInternaObjeto.month
                const anoFechaInterna = fechaInternaObjeto.year
                const fechaInternaHumana = `${anoFechaInterna}-${mesFechaInterna}-${diaFechaInterna}`
                const estructuraReservaEnDia = {
                    eventoUID: "todosLosApartamentos_" + apartamentoUID,
                    reservaUID: reservaUID,
                    apartamentoUID: apartamentoUID,
                    fechaEntrada_ISO: fechaEntrada_ISO,
                    fechaSalida_ISO: fechaSalida_ISO,
                    apartamentoIDV: apartamentoIDVReserva,
                    apartamentoUI: await obtenerApartamentoComoEntidadPorApartamentoIDV(apartamentoIDVReserva)
                }
                if (calendarioObjeto[fechaInternaHumana]) {
                    calendarioObjeto[fechaInternaHumana].push(estructuraReservaEnDia)
                }
            }
        }
        const ok = {
            eventosMes: calendarioObjeto,
            eventosEnDetalle: reservasSelecciondas
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
