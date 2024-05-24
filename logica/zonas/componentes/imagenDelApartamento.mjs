import { obtenerImagenApartamentoPorApartamentoIDV } from "../../repositorio/arquitectura/configuraciones/obtenerImagenApartamentoPorApartamentoIDV.mjs";
import { validadoresCompartidos } from "../../sistema/validadores/validadoresCompartidos.mjs";

export const imagenDelApartamento = async (entrada, salida) => {
    try {
        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El campo del identiifcador visual de apartamento (apartamentoIDV)",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const configuracionDelApartamento = await obtenerImagenApartamentoPorApartamentoIDV(apartamentoIDV)
        if (!configuracionDelApartamento.configuracionUID) {
            const error = "No existe ningun apartamento con ese identificador visua, revisa el apartamentoIDV";
            throw new Error(error);
        }
        const ok = {
            ok: "Imagen de apartamento PNG en base64",
            imagen: configuracionDelApartamento.imagen
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}