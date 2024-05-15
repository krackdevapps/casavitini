import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";

export const eliminarCuentaDesdeAdministracion = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

   
        const usuarioIDX = validadoresCompartidos.tipos.cadena({
            string: entrada.body.usuarioIDX,
            nombreCampo: "El nombre de usuario (VitiniIDX)",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
        await campoDeTransaccion("iniciar")


        // Validar si es un usuario administrador
        const validarTipoCuenta = `
                            SELECT 
                            rol
                            FROM usuarios
                            WHERE usuario = $1;
                            `;
        const resuelveValidarTipoCuenta = await conexion.query(validarTipoCuenta, [usuarioIDX]);
        const rol = resuelveValidarTipoCuenta.rows[0].rol;
        const rolAdministrador = "administrador";
        if (rol === rolAdministrador) {
            const validarUltimoAdministrador = `
                                SELECT 
                                rol
                                FROM usuarios
                                WHERE rol = $1;
                                `;
            const resuelValidarUltimoAdministrador = await conexion.query(validarUltimoAdministrador, [rolAdministrador]);
            if (resuelValidarUltimoAdministrador.rowCount === 1) {
                const error = "No se puede eliminar esta cuenta por que es la unica cuenta adminsitradora existente. Si quieres eliminar esta cuenta tienes que crear otra cuenta administradora. Por que en el sistema debe de existir al menos una cuenta adminitrador";
                throw new Error(error);
            }
        }
        const cerrarSessiones = `
                            DELETE FROM sessiones
                            WHERE sess->> 'usuario' = $1;
                            `;
        await conexion.query(cerrarSessiones, [usuarioIDX]);
        const eliminarCuenta = `
                            DELETE FROM usuarios
                            WHERE usuario = $1;
                            `;
        const resuelveEliminarCuenta = await conexion.query(eliminarCuenta, [usuarioIDX]);
        if (resuelveEliminarCuenta.rowCount === 0) {
            const error = "No se encuentra el usuario";
            throw new Error(error);
        }
        if (resuelveEliminarCuenta.rowCount === 1) {
            const ok = {
                ok: "Se ha eliminado correctamente la cuenta de usuario",
            };
            salida.json(ok);
        }
        await campoDeTransaccion("confirmar");
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar");
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    } finally {
    }
}