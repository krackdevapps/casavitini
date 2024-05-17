import { conexion } from "../../componentes/db.mjs";

export const eliminarSessionPorUsuario = async (data) => {
    const usuarioIDX = data.usuarioIDX
    const sessionIDX = data.sessionIDX
    try {
        const consulta = `
        DELETE FROM sessiones
        WHERE sid = $1 AND sess->> 'usuario' = $2;
        `;
        const parametros = [
            sessionIDX,
            usuarioIDX
        ];
        const resuelve = await conexion.query(consulta, parametros)
        if (resuelve.rowCount === 0) {
            const error = "No existe la session";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (error) {
        throw error;
    }
};
