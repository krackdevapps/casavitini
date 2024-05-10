import { conexion } from "../../componentes/db.mjs";
import { actualizarDatos } from "../../repositorio/usuarios/actualizarDatos.mjs";
import { VitiniIDX } from "../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../sistema/error/filtroError.mjs";

export const actualizarDatosUsuarioDesdeMiCas = async (entrada, salida) => {

    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        if (IDX.control()) return

        const usuarioIDX = entrada.session.usuario;
        const datosUsuario = {
            nombre: entrada.body.nombre,
            primerApellido: entrada.body.primerApellido,
            segundoApellido: entrada.body.segundoApellido,
            pasaporte: entrada.body.pasaporte,
            email: entrada.body.email.DateTime,
            telefono: entrada.body.telefono
        }
        validadoresCompartidos.usuarios.datosUsuario(datosUsuario)

        const datosUnicos = {
            usuarioIDX: usuarioIDX,
            pasaporte: datosUsuario.pasaporte,
            email: datosUsuario.email,
            operacion: "actualizar",
        }
        await conexion.query('BEGIN'); // Inicio de la transacción

        validadoresCompartidos.usuarios.unicidadPasaporteYCorrreo(datosUnicos)
        datosUsuario.usuarioIDX = usuarioIDX
        await actualizarDatos(datosUsuario)

        await conexion.query('COMMIT'); // Confirmar la transacción
        if (resuelveActualizarDatosUsuario.rowCount === 1) {
            const ok = {
                ok: "Se ha actualiza correctamente los datos del usuario",
                datosActualizados: resuelveActualizarDatosUsuario.rows
            };
            salida.json(ok);
        }
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    } 
}
