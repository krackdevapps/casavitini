import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { configuracionApartamento as configuracionApartamento_ } from "../../../sistema/configuracionApartamento.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";

export const configuracionApartamento = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return

        const apartamentos = validadoresCompartidos.tipos.array({
            array: contenedorCapas?.apartamentos,
            nombreCampo: "El array de apartamentos",
            filtro: "soloCadenasIDV",
            noSePermitenDuplicados: "si"
        })
        const transactor = await configuracionApartamento_(apartamentos);
        salida.json(transactor);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }
}