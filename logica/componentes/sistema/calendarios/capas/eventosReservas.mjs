import { DateTime } from "luxon";
import { conexion } from "../../../db.mjs";
const eventosReservas = async (fecha) => {
    try {
        const filtroFecha = /^([1-9]|1[0-2])-(\d{1,})$/;
        if (!filtroFecha.test(fecha)) {
            const error = "La fecha no cumple el formato especifico para el calendario. En este caso se espera una cadena con este formado MM-YYYY, si el mes tiene un digio, es un digito, sin el cero delante."
            throw new Error(error)
        }
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
        const reservaCancelada = "cancelada"
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
        const consultaReservas = `
        SELECT 
        reserva,
        to_char(entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO", 
        to_char(salida, 'YYYY-MM-DD') as "fechaSalida_ISO",
        (salida - entrada) as duracion_en_dias
        FROM reservas
        WHERE
        (
            DATE_PART('YEAR', entrada) < $2
            OR (
                DATE_PART('YEAR', entrada) = $2
                AND DATE_PART('MONTH', entrada) <= $1
            )
        )
        AND (
            DATE_PART('YEAR', salida) > $2
            OR (
                DATE_PART('YEAR', salida) = $2
                AND DATE_PART('MONTH', salida) >= $1
            )
        )
            AND "estadoReserva" <> $3
        ORDER BY duracion_en_dias DESC;
        `
        const resuelveReservas = await conexion.query(consultaReservas, [mes, ano, reservaCancelada])
        const reservasSelecciondas = resuelveReservas.rows.map((detallesReserva) => {
            detallesReserva.eventoUID = "reservaUID_" + detallesReserva.reserva
            return detallesReserva
        })
        for (const detallesReserva of reservasSelecciondas) {
            const reservaUID = detallesReserva.reserva
            const fechaEntrada_ISO = detallesReserva.fechaEntrada_ISO
            const fechaSalida_ISO = detallesReserva.fechaSalida_ISO
            detallesReserva.tipoEvento = "reserva"
            detallesReserva.duracion_en_dias = detallesReserva.duracion_en_dias + 1
            const arrayConFechasInternas = obtenerFechasInternas(fechaEntrada_ISO, fechaSalida_ISO)
            for (const fechaInterna_ISO of arrayConFechasInternas) {
                const fechaInternaObjeto = DateTime.fromISO(fechaInterna_ISO)
                const diaFechaInterna = fechaInternaObjeto.day
                const mesFechaInterna = fechaInternaObjeto.month
                const anoFechaInterna = fechaInternaObjeto.year
                const fechaInternaHumana = `${anoFechaInterna}-${mesFechaInterna}-${diaFechaInterna}`
                const estructuraReservaEnDia = {
                    eventoUID: "reservaUID_" + reservaUID,
                    fechaEntrada_ISO: fechaEntrada_ISO,
                    fechaSalida_ISO: fechaSalida_ISO
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
export {
    eventosReservas
}