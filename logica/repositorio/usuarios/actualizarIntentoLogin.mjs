import { conexion } from "../../componentes/db.mjs";

export const actualizarIntentoLogin = async (data) => {
    const usuarioIDX = data.usuarioIDX
    const intento = data.intento
    try {
        const consulta = `
        UPDATE 
            usuarios
        SET     
            intentos = $1
        WHERE 
            usuario = $2
        RETURNING
            intentos;`;
        const parametros = [
            usuarioIDX,
            intento
        ];
        const resuelve = await conexion.query(consulta, parametros)
        if (resuelve.rowCount === 0) {
            const error = "No existe el usuario";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (error) {
        throw error;
    }
};
