import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../../sistema/error/filtroError.mjs";
import { obtenerMensajePorMensajeUID } from "../../../../repositorio/configuracion/mensajesPortada/obtenerMensajePorMensajeUID.mjs";
import { obtenerMensajePorPosicion } from "../../../../repositorio/configuracion/mensajesPortada/obtenerMensajePorPosicion.mjs";
import { obtenerTodosLosMensjaes } from "../../../../repositorio/configuracion/mensajesPortada/obtenerTodosLosMensajes.mjs";
import { actualizarPosicionDelMensajeDePortada } from "../../../../repositorio/configuracion/mensajesPortada/actualizarPosicionMensajeDePortada.mjs";
import { campoDeTransaccion } from "../../../../componentes/campoDeTransaccion.mjs";

export const moverPosicion = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const mensajeUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.mensajeUID,
            nombreCampo: "El campo mensajeUID",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const nuevaPosicion = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nuevaPosicion,
            nombreCampo: "El campo nuevaPosicion",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const mensajeDePortadaa = await obtenerMensajePorMensajeUID(mensajeUID)

        const posicionAntigua = mensajeDePortadaa.posicion;
        if (Number(posicionAntigua) === Number(nuevaPosicion)) {
            const error = "El mensaje ya esta en esa posicion";
            throw new Error(error);
        }

        const todosLosMensaje = await obtenerTodosLosMensjaes()
        const totalMensajes = todosLosMensaje.length

        if (Number(totalMensajes) === 1) {
            const error = "Solo hay un mensaje, por lo tanto mover la poscion es irrelevante.";
            throw new Error(error);
        }

        if (Number(totalMensajes) < Number(nuevaPosicion)) {
            const error = "La posicion no puede ser superior a: " + totalMensajes;
            throw new Error(error);
        }

        const mensajeSeleccionado = {};
        const mensajeSeleccionado_texto = mensajeDePortadaa.mensaje;
        const bufferObjPreDecode = Buffer.from(mensajeSeleccionado_texto, "base64");

        mensajeSeleccionado.uid = mensajeUID;
        mensajeSeleccionado.mensaje = bufferObjPreDecode.toString("utf8");
        mensajeSeleccionado.estado = mensajeDePortadaa.estado;

        const detallesMensajeAfectado = await obtenerMensajePorPosicion(nuevaPosicion)

        const mensajeUIDAfectado = detallesMensajeAfectado.uid;
        const mensajeUIDAfectado_mensaje = detallesMensajeAfectado.mensaje;
        const buffer_mensajeAfectado = Buffer.from(mensajeUIDAfectado_mensaje, "base64");

        const mensajeAfectado = {
            uid: String(mensajeUIDAfectado),
            mensaje: buffer_mensajeAfectado.toString("utf8"),
            estado: detallesMensajeAfectado.estado
        };
        await campoDeTransaccion("iniciar")

        const dataActualizarPosicionDelMensaje_1 = {
            mensajeUID: mensajeUIDAfectado,
            posicion: "0"
        }
        await actualizarPosicionDelMensajeDePortada(dataActualizarPosicionDelMensaje_1)

        const dataActualizarPosicionDelMensajeActual = {
            mensajeUID: mensajeUID,
            posicion: nuevaPosicion
        }
        await actualizarPosicionDelMensajeDePortada(dataActualizarPosicionDelMensajeActual)

        // Posicion de final a elementoAfectado
        const dataActualizarPosicionDelMensajeFinal = {
            mensajeUID: mensajeUIDAfectado,
            posicion: posicionAntigua
        }
        await actualizarPosicionDelMensajeDePortada(dataActualizarPosicionDelMensajeFinal)

        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha actualizado correctamente la posicion",
            mensajeSeleccionado: mensajeSeleccionado,
            mensajeAfectado: mensajeAfectado
        };
        salida.json(ok);
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }

}