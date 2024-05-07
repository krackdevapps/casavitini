import { Mutex } from "async-mutex";
import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";

export const actualizarEstadoOferta = async (entrada, salida) => {
    let mutex
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return

        mutex = new Mutex()
        await mutex.acquire();

        const ofertaUID = validadoresCompartidos.tipos.numero({
            string: entrada.body.ofertaUID,
            nombreCampo: "El campo ofertaUID ",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const estadoOferta = validadoresCompartidos.tipos.cadena({
            string: entrada.body.estadoOferta,
            nombreCampo: "El campo estadoOferta",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

        // Validar nombre unico oferta
        const validarOferta = `
                            SELECT uid
                            FROM ofertas
                            WHERE uid = $1;
                            `;
        const resuelveValidarOferta = await conexion.query(validarOferta, [ofertaUID]);
        if (resuelveValidarOferta.rowCount === 0) {
            const error = "No existe al oferta, revisa el UID introducie en el campo ofertaUID, recuerda que debe de ser un number";
            throw new Error(error);
        }
        await conexion.query('BEGIN'); // Inicio de la transacción
        const actualizarEstadoOferta = `
                            UPDATE ofertas
                            SET "estadoOferta" = $2
                            WHERE uid = $1
                            RETURNING "estadoOferta";
                            `;
        const datos = [
            ofertaUID,
            estadoOferta,
        ];
        const resuelveEstadoOferta = await conexion.query(actualizarEstadoOferta, datos);
        const ok = {
            "ok": "El estado de la oferta se ha actualziado correctamente",
            "estadoOferta": resuelveEstadoOferta.rows[0].estadoOferta
        };
        salida.json(ok);
        await conexion.query('COMMIT'); // Confirmar la transacción
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    } finally {
        if (mutex) {
            mutex.release();
        }
    }
}