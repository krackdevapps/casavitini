import { obtenerOfertasPorRangoPorEstado } from "../../repositorio/ofertas/perfiles/obtenerOfertasPorRangoPorEstado.mjs"
import { aplicarDescuento } from "./aplicarDescuento.mjs"
import { selectorPorCondicion } from "./selectorPorCondicion.mjs"

export const aplicarOfertas = async (data) => {
    try {
        const totalesBase = data.totalesBase
        const fechaActual = data.fechaActual
        const fechaEntrada = data.fechaEntrada
        const fechaSalida = data.fechaSalida
        const apartamentosArray = data.apartamentosArray
        const zonasDeLaOferta = data.zonasDeLaOferta

        const ofertasSeleccionadasPorRango = await obtenerOfertasPorRangoPorEstado({
            fechaEntradaReserva_ISO: fechaEntrada,
            fechaSalidaReserva_ISO: fechaSalida,
            estado: "activado",
            zonasDeLaOferta
        })
 
        const ofertaAnalizadasPorCondiciones = []
        for (const oferta of ofertasSeleccionadasPorRango) {
            const resultadoSelector = await selectorPorCondicion({
                oferta,
                apartamentosArray,
                fechaActual_reserva: fechaActual,
                fechaEntrada_reserva: fechaEntrada,
                fechaSalida_reserva: fechaSalida,
            })
            ofertaAnalizadasPorCondiciones.push(resultadoSelector)
        }
        
        await aplicarDescuento({
            ofertarParaAplicarDescuentos: ofertaAnalizadasPorCondiciones,
            totalesBase: totalesBase,
            fechaEntradaReserva_ISO: fechaEntrada,
            fechaSalidaReserva_ISO: fechaSalida
        })
        
        
        
    } catch (error) {
        throw error
    }
}
