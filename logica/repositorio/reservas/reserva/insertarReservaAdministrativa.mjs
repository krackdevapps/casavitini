import { conexion } from "../../../componentes/db.mjs"

export const insertarReservaAdministrativa = async (data) => {
    try {
        const fechaEntrada_ISO = data.fechaEntrada_ISO
        const fechaSalida_ISO = data.fechaSalida_ISO
        const estadoReserva = data.estadoReserva
        const origen = data.origen
        const fechaCreacion_ISO = data.fechaCreacion
        const estadoPago = data.estadoPago
        const reservaTVI = data.reservaTVI

        const consulta = `
        INSERT INTO
        reservas 
        (
        "fechaEntrada",
        "fechaSalida",
        "estadoReservaIDV",
        "origenIDV",
        "fechaCreacion",
        "estadoPagoIDV",
        "reservaTVI")
        VALUES
        ($1,$2,$3,$4,$5,$6,$7)
        RETURNING 
        * `;
        const parametros = [
            fechaEntrada_ISO,
            fechaSalida_ISO,
            estadoReserva,
            origen,
            fechaCreacion_ISO,
            estadoPago,
            reservaTVI
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha insertado la reserva.";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

