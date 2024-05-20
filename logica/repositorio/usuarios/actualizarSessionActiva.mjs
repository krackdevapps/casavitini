import { conexion } from "../../componentes/db.mjs";

export const actualizarUsuarioSessionActiva = async (data) => {
    const usuarioIDX = data.usuarioIDX
    const nuevoIDX = data.nuevoIDX
    try {
        const consulta =`
        UPDATE 
        sessiones
        SET 
        sess = jsonb_set(sess::jsonb, '{usuario}', $1::jsonb)::json
        WHERE 
        sess->>'usuario' = $2;

        `;
        const parametros = [
            usuarioIDX,
            nuevoIDX
        ];
        const resuelve = await conexion.query(consulta, parametros)
        return resuelve.rows[0]
    } catch (error) {
        throw error;
    }
};