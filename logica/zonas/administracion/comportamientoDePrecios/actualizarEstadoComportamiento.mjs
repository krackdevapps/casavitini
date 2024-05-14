import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";
import { obtenerComportamientoDePrecioPorComportamientoUID } from "../../../repositorio/comportamientoDePrecios/obtenerComportamientoDePrecioPorComportamientoUID copia.mjs";
import { campoDeTransaccion } from "../../../componentes/campoDeTransaccion.mjs";

export const actualizarEstadoComportamiento = async (entrada, salida) => {
    const mutex = new Mutex();

    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        await mutex.acquire();

        const comportamientoUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.comportamientoUID,
            nombreCampo: "El identificador universal de la comportamiento (comportamientoUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        const estadoPropuesto = validadoresCompartidos.tipos.cadena({
            string: entrada.body.estadoPropuesto,
            nombreCampo: "El estadoPropuesto",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
        await campoDeTransaccion("iniciar")
        await obtenerComportamientoDePrecioPorComportamientoUID(comportamientoUID)
        
        const dataActualizarComportamientoDePrecio = [
            estadoPropuesto,
            comportamientoUID
        ]
        await actualizarEstadoComportamiento(dataActualizarComportamientoDePrecio)
        const ok = {
            ok: "El estado del comportamiento se ha actualziado correctamente",
            estadoComportamiento: resuelveEstadoOferta.rows[0].estado
        };
        salida.json(ok);
        await campoDeTransaccion("confirmar")
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    } finally {
        mutex.release();
    }
}