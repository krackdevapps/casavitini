import { DateTime } from "luxon";
import { conexion } from "../../../componentes/db.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";

export const validarCodigo = async (entrada, salida) => {
    try {
        const codigo = validadoresCompartidos.tipos.cadena({
            string: entrada.body.codigo,
            nombreCampo: "El codigo de verificación",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

        const fechaActual_ISO = DateTime.utc().toISO();
        const eliminarEnlacesCaducados = `
            DELETE FROM "enlaceDeRecuperacionCuenta"
            WHERE "fechaCaducidad" < $1;
            `;
        await conexion.query(eliminarEnlacesCaducados, [fechaActual_ISO]);
        await conexion.query('BEGIN'); // Inicio de la transacción   
        const consultaValidarCodigo = `
                SELECT 
                usuario
                FROM "enlaceDeRecuperacionCuenta"
                WHERE codigo = $1;
                `;
        const resuelveValidarCodigo = await conexion.query(consultaValidarCodigo, [codigo]);
        if (resuelveValidarCodigo.rowCount === 0) {
            const error = "El código que has introducido no existe. Si estás intentando recuperar tu cuenta, recuerda que los códigos son de un solo uso y duran una hora. Si has generado varios códigos, solo es válido el más nuevo.";
            throw new Error(error);
        }
        if (resuelveValidarCodigo.rowCount === 1) {
            const usuario = resuelveValidarCodigo.rows[0].usuario;
            const ok = {
                ok: "El enlace temporal sigue vigente",
                usuario: usuario
            };
            salida.json(ok);
        }
        await conexion.query('COMMIT'); // Confirmar la transacción
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
        console.info(errorCapturado.message);
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }
}