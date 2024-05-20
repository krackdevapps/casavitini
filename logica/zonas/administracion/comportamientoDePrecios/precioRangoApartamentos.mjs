import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { precioRangoApartamento } from "../../../sistema/precios/precioRangoApartamento.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";

export const precioRangoApartamentos = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const fechaEntrada = entrada.body.fechaEntrada;
        const fechaSalida = entrada.body.fechaSalida;
        await validadoresCompartidos.fechas.validarFecha_Humana(fechaEntrada)
        await validadoresCompartidos.fechas.validarFecha_Humana(fechaSalida)

        const apartamentosIDVArreglo = validadoresCompartidos.tipos.array({
            array: entrada.body.apartamentosIDVArreglo,
            nombreCampo: "El apartamentosIDVArreglo",
            filtro: "soloCadenasIDV",
            noSePermitenDuplicados: "si"
        })

        const metadatos = {
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida,
            apartamentosIDVArreglo: apartamentosIDVArreglo
        };
        const preciosApartamentosResuelos = await precioRangoApartamento(metadatos);
        const ok = {
            ok: preciosApartamentosResuelos
        };
        salida.json(ok);
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}