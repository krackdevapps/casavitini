import { conexion } from "../../../componentes/db.mjs";
export const obtenerTitularReservaPorReservaUID = async (reservaUID) => {
    try {
        const consulta = `
        SELECT 
        *
        FROM 
        "reservaTitulares"
        WHERE 
        "reservaUID" = $1;`;

        const resuelve = await conexion.query(consulta, [reservaUID])
        return resuelve.rows[0]
    } catch (error) {
        throw error
    }
}
