import { conexion } from "../../componentes/db.mjs";

export const insertarUsuario = async (data) => {
    const usuarioIDX = data.usuarioIDX
    const rolIDV = data.rolIDV
    const estadoCuenta = data.estadoCuenta
    const nuevaSal = data.nuevaSal
    const hashCreado = data.hashCreado
    const cuentaVerificada = data.cuentaVerificada
    const fechaCaducidadCuentaNoVerificada = data.fechaCaducidadCuentaNoVerificada

    try {
        const consulta = `
        INSERT INTO usuarios
        (
        usuario,
        "rolIDV",
        "estadoCuentaIDV",
        sal,
        clave,
        "cuentaVerificadaIDV",
        "fechaCaducidadCuentaNoVerificada"
        )
        VALUES 
        ($1, $2, $3, $4, $5, $6)
        RETURNING
        usuario
        `;
        const parametros = [
            usuarioIDX,
            rolIDV,
            estadoCuenta,
            nuevaSal,
            hashCreado,
            cuentaVerificada,
            fechaCaducidadCuentaNoVerificada
        ];
        const resuelve = await conexion.query(consulta, parametros)
        if (resuelve.rowCount === 0) {
            const error = "No se ha insertado el nuevo usuario en la base de datos";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (error) {
        throw error;
    }
};
