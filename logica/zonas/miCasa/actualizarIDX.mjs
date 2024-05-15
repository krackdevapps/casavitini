import { Mutex } from "async-mutex";
import { conexion } from "../../componentes/db.mjs";
import { VitiniIDX } from "../../sistema/VitiniIDX/control.mjs";
import { eliminarCuentasNoVerificadas } from "../../sistema/VitiniIDX/eliminarCuentasNoVerificadas.mjs";
import { validarIDXUnico } from "../../sistema/VitiniIDX/validarIDXUnico.mjs";
import { validadoresCompartidos } from "../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../sistema/error/filtroError.mjs";

export const actualizarIDX = async (entrada, salida) => {
    const mutex = new Mutex()
    try {
        mutex.acquire()
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.control()

        const actualIDX = entrada.session.usuario;
        const nuevoIDX = validadoresCompartidos.tipos.cadena({
            string: entrada.body.usuarioIDX,
            nombreCampo: "El nombre de usuario (VitiniIDX)",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

        if (actualIDX === nuevoIDX) {
            const error = "El nuevo VitiniID que has elegido es igual al que ya tienes."
            throw new Error(error)

        }
        await validarIDXUnico(nuevoIDX)
        await eliminarCuentasNoVerificadas();
        await campoDeTransaccion("iniciar")

        const data = {
            actualIDX: actualIDX,
            nuevoIDX: nuevoIDX
        }
        await actualizarIDX(data)

        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha actualizado el IDX correctamente",
            usuarioIDX: nuevoIDX
        };
        salida.json(ok);

    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    } finally {
        mutex.release()
    }
}
