import Decimal from "decimal.js";
import { precioBaseApartamento } from "../../../sistema/contenedorFinanciero/entidades/reserva/precioBaseApartamento.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";


export const detallePrecioBaseApartamento = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()


        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El campo apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const transaccionInterna = await precioBaseApartamento(apartamentoIDV);

        //  transaccionInterna.precioNetoPorDia = new Decimal(transaccionInterna.precioNetoPorDia).toFixed(2)
        //  transaccionInterna.totalImpuestos = new Decimal(transaccionInterna.totalImpuestos).toFixed(2)
        //  transaccionInterna.totalBrutoPordia = new Decimal(transaccionInterna.totalBrutoPordia).toFixed(2)
        transaccionInterna.impuestos.forEach((impuesto) => {
            const tipoImpositivo = impuesto.tipoImpositivo;
            const totalImpuesto = impuesto.totalImpuesto;
            impuesto.tipoImpositivo = new Decimal(tipoImpositivo).toFixed(2);
            impuesto.totalImpuesto = new Decimal(totalImpuesto).toFixed(2);
        });

        const ok = {
            ok: transaccionInterna
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    } finally {
    }

}