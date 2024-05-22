import { conexion } from "../../componentes/db.mjs";

export const eliminarSessionPorUsuario = async (usuarioIDX) => {
    try {
        const consulta = `
        DELETE FROM sessiones
        WHERE sess->> 'usuario' = $1;
        `;
        await conexion.query(consulta, [usuarioIDX])
    } catch (errorCapturado) {
        throw error;
    }
};
