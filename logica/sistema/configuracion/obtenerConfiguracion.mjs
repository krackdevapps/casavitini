import { obtenerParConfiguracion } from "../../repositorio/configuracion/parConfiguracion/obtenerParConfiguracion.mjs";
import { validadoresCompartidos } from "../validadores/validadoresCompartidos.mjs";

export const obtenerConfiguracion = async (arrayConfiguracionesUID) => {
    try {
        validadoresCompartidos.tipos.array({
            array: arrayConfiguracionesUID,
            nombreCampo: "El sistema de configuracion",
            filtro: "soloCadenasIDV",
            sePermitenDuplicados: "no"
        })

        const parConfiguracion = await obtenerParConfiguracion(arrayConfiguracionesUID)
        return parConfiguracion
    } catch (errorCapturado) {
        throw errorCapturado
    }

}