import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../../../configuracion/codigoZonaHoraria.mjs";
import { validadoresCompartidos } from "../../../validadores/validadoresCompartidos.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../repositorio/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { totalesBasePorRango } from "./totalesBasePorRango.mjs";
import { selecionarOfertasPorCondicion } from "../../../ofertas/entidades/reserva/selecionarOfertasPorCondicion.mjs";
import { aplicarDescuentosPersonalizados } from "../../../ofertas/entidades/reserva/aplicarDescuentosPersonalizados.mjs";
import { aplicarDescuento } from "../../../ofertas/entidades/reserva/aplicarDescuento.mjs";
import { contructorEstructuraDescuentosReserva } from "../../../ofertas/entidades/reserva/contructorEstructuraDescuentosReserva.mjs";
import { constructorEstructuraDescuentos } from "../../../ofertas/global/contructorEstructuraDescuentos.mjs";
import { aplicarImpuestos } from "./aplicarImpuestos.mjs";
import { constructorInstantaneaNoches } from "./constructorInstantaneaNoches.mjs";

export const crearDesgloseFinanciero = async (data) => {
    try {
        const estructura = data.estructura

        const fechaEntrada = await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: data.fechaEntrada,
            nombreCampo: "La fecha de entrada del procesador de precios"
        })

        const fechaSalida = await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: data.fechaSalida,
            nombreCampo: "La fecha de salida del procesador de precios"
        })

        await validadoresCompartidos.fechas.validacionVectorial({
            fechaEntrada_ISO: data.fechaEntrada,
            fechaSalida_ISO: data.fechaSalida,
            tipoVector: "diferente"
        })

        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        const fechaActual = DateTime.now().setZone(zonaHoraria).toISODate()
        
        const apartamentosArray = validadoresCompartidos.tipos.array({
            array: data.apartamentosArray,
            nombreCampo: "El array de apartamentos en el procesador de precios",
            filtro: "soloCadenasIDV",
            sePermitenDuplicados: "no"
        })

        for (const apartamentoIDV of apartamentosArray) {
            await obtenerConfiguracionPorApartamentoIDV(apartamentoIDV)
        }

        const capaOfertas = data?.capaOfertas
        const capaDescuentosPersonalizados = data?.capaDescuentosPersonalizados

        if (capaOfertas !== "si" && capaOfertas !== "no") {
            const error = "El procesador de precios esta mal configurado, necesita parametro capaOfertas"
            throw new Error(error)
        }
        if (capaDescuentosPersonalizados !== "si" && capaDescuentosPersonalizados !== "no") {
            const error = "El procesador de precios esta mal configurado, necesita parametro capaDescuentosPersonalizados con un si o un no"
            throw new Error(error)
        }

        await constructorInstantaneaNoches({
            estructura,
            fechaEntrada_ISO: fechaEntrada,
            fechaSalida_ISO: fechaSalida,
            fechaCreacion_ISO: fechaActual,
            apartamentosArray
        })

        await totalesBasePorRango({
            estructura,
            fechaEntrada_ISO: fechaEntrada,
            fechaSalida_ISO: fechaSalida,
            apartamentosArray,
        })

        if (capaOfertas === "si") {
            const zonasArray = validadoresCompartidos.tipos.array({
                array: data?.zonasArray,
                nombreCampo: "El array de zonasArray en el procesador de precios",
                filtro: "soloCadenasIDV",
                sePermitenDuplicados: "no"
            })
            const zonasIDVControl = ["publica", "privada", "global"]

            const contieneSoloValoresPermitidos = zonasArray.every(zonaIDV => zonasIDVControl.includes(zonaIDV));
            if (!contieneSoloValoresPermitidos) {
                const error = "En el array de zonasArray hay identificadores visuales de zona no reconocidos. Los identificadores visuales reconocidos son publica, privada y global"
                throw new Error(error)
            }
            const descuentosParaRechazar = validadoresCompartidos.tipos.array({
                array: data?.descuentosParaRechazar || [],
                nombreCampo: "descuentosParaRechazar en el procesador de precios",
                filtro: "soloCadenasIDV",
                sePermitenDuplicados: "si",
                sePermiteArrayVacio: "si"
            })
            constructorEstructuraDescuentos(estructura)
            contructorEstructuraDescuentosReserva(estructura)
            const ofertasSelecionadasPorCondicion = await selecionarOfertasPorCondicion({
                estructura,
                fechaActual,
                fechaEntrada,
                fechaSalida,
                apartamentosArray,
                zonasArray,
                descuentosParaRechazar
            })
            await aplicarDescuento({
                origen: "porCondicion",
                ofertasParaAplicarDescuentos: ofertasSelecionadasPorCondicion,
                estructura,
                fechaEntradaReserva_ISO: fechaEntrada,
                fechaSalidaReserva_ISO: fechaSalida
            })
        }
        if (capaDescuentosPersonalizados === "si") {
            const descuentosArray = validadoresCompartidos.tipos.array({
                array: data.descuentosArray,
                nombreCampo: "El array de descuentosArray en el procesador de precios",
                filtro: "cadenaConNumerosEnteros",
                sePermitenDuplicados: "si"
            })
            constructorEstructuraDescuentos(estructura)
            contructorEstructuraDescuentosReserva(estructura)

            const ofertasSelecionadasPorAdminstrador = await aplicarDescuentosPersonalizados({
                descuentosArray
            })

            await aplicarDescuento({
                origen: "porAdministrador",
                ofertasParaAplicarDescuentos: ofertasSelecionadasPorAdminstrador,
                estructura: estructura,
                fechaEntradaReserva_ISO: fechaEntrada,
                fechaSalidaReserva_ISO: fechaSalida
            })
        }

        const capaImpuestos = data.capaImpuestos
        if (capaImpuestos !== "si" && capaImpuestos !== "no") {
            const error = "El procesador de precios esta mal configurado, necesita parametro capaImpuestos en si o no"
            throw new Error(error)
        }
        if (capaImpuestos === "si") {
            await aplicarImpuestos({
                estructura,
                origen: "administracion"
            })
        }
    } catch (error) {
        throw error
    }
}