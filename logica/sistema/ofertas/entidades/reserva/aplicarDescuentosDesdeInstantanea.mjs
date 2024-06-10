import { obtenerOfertasPorArrayUID } from "../../../../repositorio/ofertas/perfiles/obtenerOfertasPorArrayUID.mjs"
import { aplicarDescuento } from "./aplicarDescuento.mjs"

export const aplicarDescuentosDesdeInstantanea = async (data) => {

    const estructura = data.estructura
    const descuentosArray = data.descuentosArray
    const fechaEntradaReserva_ISO = data.fechaEntradaReserva_ISO
    const fechaSalidaReserva_ISO = data.fechaSalidaReserva_ISO
    const ofertasSeleccionadas = await obtenerOfertasPorArrayUID(descuentosArray)
    // revice el reservaUID, 
    // estrae la instantanea
    // aplicar los descunetos

    const ofertaAnalizadasPorCondiciones = []
    for (const oferta of ofertasSeleccionadas) {
        const ofertaEstructura = {
            oferta
        }
        ofertaAnalizadasPorCondiciones.push(ofertaEstructura)
    }
    await aplicarDescuento({
        ofertarParaAplicarDescuentos: ofertaAnalizadasPorCondiciones,
        estructura: estructura,
        fechaEntradaReserva_ISO,
        fechaSalidaReserva_ISO
    })



}