import { conexion } from "../../../componentes/db.mjs"

export const insertarReembolso = async (data) => {
    try {

        const pagoUID = data.pagoUID
        const cantidad = data.cantidad
        const plataformaDePagoEntrada = data.plataformaDePagoEntrada
        const reembolsoUIPasarela = data.reembolsoUIPasarela
        const estadoReembolso = data.estadoReembolso
        const fechaCreacion = data.fechaCreacion
        const fechaActualizacion = data.fechaActualizacion

        const consulta = `
        INSERT INTO
            "reservaReembolsos"
            (
            "pagoUID",
            cantidad,
            "plataformaDePago",
            "reembolsoUIDPasarela",
            estado,
            "fechaCreacion",
            "fechaActualizacion"
            )
        VALUES 
            ($1,$2,$3,$4,$5,$6,$7)
        RETURNING
            "reembolsoUID"
        `;
        const parametros = [
            pagoUID,
            cantidad,
            plataformaDePagoEntrada,
            reembolsoUIPasarela,
            estadoReembolso,
            fechaCreacion,
            fechaActualizacion,
        ];
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha podido insertar el reembolso.";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (error) {
        throw error
    }
}

