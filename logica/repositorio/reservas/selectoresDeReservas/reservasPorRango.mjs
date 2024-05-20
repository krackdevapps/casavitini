import { conexion } from "../../../componentes/db.mjs"

export const reservasPorRango = async (metadatos) => {
    try {
        // En el caso y caso 3, los operadores son mayos que e igual que. Si se quiera que se seleccionaran reservas del mismo dia incluido acuerdate del igual. Pero como las reservas pueden compartir dias de salida y de entrada, por el tema de las horas de salida y de entrada, este script funciona asi.
        const fechaIncioRango_ISO = metadatos.fechaIncioRango_ISO
        const fechaFinRango_ISO = metadatos.fechaFinRango_ISO
        const estadoReservaCancelada = "cancelada"
        const consultaReservas = `
        SELECT "reservaUID" 
        FROM reservas  
        WHERE                     
        (
            (
                -- Caso 1: Evento totalmente dentro del rango
                "fechaEntrada" >= $1::DATE AND "fechaSalida" <= $2::DATE
            )
            OR
            (
                -- Caso 2: Evento parcialmente dentro del rango
                ("fechaEntrada" < $1::DATE AND "fechaSalida" > $1::DATE)
                OR ("fechaEntrada" < $2::DATE AND "fechaSalida" > $2::DATE)
            )
            OR
            (
                -- Caso 3: Evento atraviesa el rango
                "fechaEntrada" < $1::DATE AND "fechaSalida" > $2::DATE
            )
        )
        AND "estadoReservaIDV" <> $3;`
        const parametros = [
            fechaIncioRango_ISO,
            fechaFinRango_ISO,
            estadoReservaCancelada
        ]
        const resuelveRreservas = await conexion.query(consultaReservas, parametros)
        return resuelveRreservas.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
