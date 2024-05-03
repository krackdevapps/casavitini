import { componentes } from "../../componentes.mjs";
import { conexion } from "../../componentes/db.mjs";

export const estado = async (entrada, salida) => {
    try {
        const IDX = entrada.body.IDX
        if (!IDX) {
            const error = "Falta espeficiar la 'IDX', este puede ser conectar, desconectar y estado";
            throw new Error(error);
        }
        await componentes.eliminarCuentasNoVerificadas();
        await componentes.borrarCuentasCaducadas();

        const usuario = entrada.session?.usuario;
        const rol = entrada.session?.rol;
        const respuesta = {};
        if (usuario) {
            respuesta.estado = "conectado";
            respuesta.usuario = usuario;
            respuesta.rol = rol;
            respuesta.cuentaVerificada = "no";
            const consultaEstadoVerificado = `
                    SELECT
                    "cuentaVerificada"
                    FROM 
                    usuarios 
                    WHERE 
                    usuario = $1
                    `;
            const resuelveEstadoVerificado = await conexion.query(consultaEstadoVerificado, [usuario]);
            const estadoCuenta = resuelveEstadoVerificado.rows[0].cuentaVerificada;
            if (estadoCuenta === "si") {
                respuesta.cuentaVerificada = "si";
            }
        } else {
            respuesta.estado = "desconectado";
        }
        salida.json(respuesta);

    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }
}
