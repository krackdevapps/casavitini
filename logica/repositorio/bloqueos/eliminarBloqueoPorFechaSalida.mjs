import { conexion } from "../../componentes/db.mjs";

export const eliminarBloqueoPorFechaSalida = async (fechaActual_ISO) => {
    try {
        const consulta = `
        DELETE FROM "bloqueosApartamentos"
        WHERE "fechaFin" < $1;
        `;

        const resuelve = await conexion.query(consulta, [fechaActual_ISO])
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}