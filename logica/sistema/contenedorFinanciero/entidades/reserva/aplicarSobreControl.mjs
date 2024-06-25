import Decimal from 'decimal.js';
import { obtenerSobreControlDeLaNoche } from '../../../../repositorio/reservas/transacciones/sobreControl/obtenerSobreControlDeLaNoche.mjs';
const precisionDecimal = Number(process.env.PRECISION_DECIMAL)

Decimal.set({ precision: precisionDecimal });
export const aplicarSobreControl = async (data) => {
    try {
        const netoApartamento = new Decimal(data.netoApartamento)
        const fechaNoche = data.fechaNoche
        const apartamentoIDV = data.apartamentoIDV
        const reservaUID = data.reservaUID
        const sobreControl = await obtenerSobreControlDeLaNoche({
            reservaUID,
            fechaNoche,
            apartamentoIDV
        })
        const respuesta = {}
        const detallesSobreControl = sobreControl?.detallesSobreControl
        const operacion = detallesSobreControl?.operacion
        const valor = detallesSobreControl?.valor

        if (!sobreControl) {
            respuesta.encontrado = "no"
        } else if (operacion === "aumentarPorPorcentaje") {
            const calculo = netoApartamento.times(valor).dividedBy(100)
            const netoSobreControlado = netoApartamento.plus(calculo)

            respuesta.encontrado = "si"
            respuesta.detallesSobreControl = detallesSobreControl
            respuesta.valorFinal = netoSobreControlado
        } else if (operacion === "reducirPorPorcentaje") {
            const calculo = netoApartamento.times(valor).dividedBy(100)
            const netoSobreControlado = netoApartamento.minus(calculo)
            respuesta.encontrado = "si"
            respuesta.detallesSobreControl = detallesSobreControl

            if (netoSobreControlado.isNegative()) {
                respuesta.valorFinal = "0.00"
            } else {
                respuesta.valorFinal = netoSobreControlado
            }
        } else if (operacion === "aumentarPorCantidadFija") {
            const netoSobreControlado = netoApartamento.plus(valor)
            respuesta.encontrado = "si"
            respuesta.detallesSobreControl = detallesSobreControl
            respuesta.valorFinal = netoSobreControlado
        } else if (operacion === "reducirPorCantidadFila") {
            const netoSobreControlado = netoApartamento.minus(valor)
            respuesta.encontrado = "si"
            respuesta.detallesSobreControl = detallesSobreControl
            if (netoSobreControlado.isNegative()) {
                respuesta.valorFinal = "0.00"
            } else {
                respuesta.valorFinal = netoSobreControlado
            }
        } else if (operacion === "establecerCantidad") {
            respuesta.encontrado = "si"
            respuesta.detallesSobreControl = detallesSobreControl
            respuesta.valorFinal = netoSobreControlado
        } else {
            const error = "En aplicarSobreControl no reconoce la operacion"
            throw new Error(error)
        }
        return respuesta
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
