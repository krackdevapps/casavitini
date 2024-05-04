import { conexion } from "../../../../componentes/db.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { actualizarEstadoPago } from "../../../../sistema/sistemaDePrecios/actualizarEstadoPago.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";


export const eliminarPagoManual = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return

        const palabra = entrada.body.palabra;
        const pagoUID = entrada.body.pagoUID;
        const reservaUID = entrada.body.reservaUID;
        if (palabra !== "eliminar") {
            const error = "Necesario escribir la la palabra eliminar para confirmar la eliminación y evitar falsos clicks";
            throw new Error(error);
        }
        const filtroPagoUID = /^\d+$/;
        if (!filtroPagoUID.test(pagoUID)) {
            const error = "El pagoUID debe de ser una cadena con numeros";
            throw new Error(error);
        }
        await conexion.query('BEGIN'); // Inicio de la transacción
        await validadoresCompartidos.reservas.validarReserva(reservaUID);
        const consultaEliminarPago = `
                            DELETE FROM "reservaPagos"
                            WHERE "pagoUID" = $1 AND reserva = $2;
                            `;
        await conexion.query(consultaEliminarPago, [pagoUID, reservaUID]);
        // Importante esto al afinal
        await actualizarEstadoPago(reservaUID);
        await conexion.query('COMMIT'); // Confirmar la transacción
        const ok = {
            ok: "Se ha eliminado irreversiblemente el pago",
            pagoUID: pagoUID
        };
        salida.json(ok);
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }
}