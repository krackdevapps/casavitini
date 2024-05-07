import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { apartamentosPorRango } from "../../../sistema/selectoresCompartidos/apartamentosPorRango.mjs";
import { resolverApartamentoUI } from "../../../sistema/sistemaDeResolucion/resolverApartamentoUI.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";


export const apartamentosDisponiblesParaAnadirAReserva = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return


        const fechaEntrada = entrada.body.entrada;
        const fechaSalida = entrada.body.salida;
        const fechaEntrada_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaEntrada)).fecha_ISO;
        const fechaSalida_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaSalida)).fecha_ISO;
        const rol = entrada.session.rol;
        const configuracionApartamentosPorRango = {
            fechaEntrada_ISO: fechaEntrada_ISO,
            fechaSalida_ISO: fechaSalida_ISO,
            rol: rol,
            origen: "administracion"
        };
        const transactor = await apartamentosPorRango(configuracionApartamentosPorRango);
        const apartamentosDisponbilesIDV = transactor.apartamentosDisponibles;
        const apartamentosNoDisponiblesIDV = transactor.apartamentosNoDisponibles;
        const estructuraFinal = {
            apartamentosDisponibles: [],
            apartamentosNoDisponibles: []
        };
        for (const apartamentoIDV of apartamentosDisponbilesIDV) {
            const apartamentoUI = await resolverApartamentoUI(apartamentoIDV);
            const detalleApartamento = {
                apartamentoIDV: apartamentoIDV,
                apartamentoUI: apartamentoUI
            };
            estructuraFinal.apartamentosDisponibles.push(detalleApartamento);
        }
        for (const apartamentoIDV of apartamentosNoDisponiblesIDV) {
            const apartamentoUI = await resolverApartamentoUI(apartamentoIDV);
            const detalleApartamento = {
                apartamentoIDV: apartamentoIDV,
                apartamentoUI: apartamentoUI
            };
            estructuraFinal.apartamentosNoDisponibles.push(detalleApartamento);
        }
        if (transactor) {
            const ok = {
                ok: estructuraFinal
            };
            salida.json(ok);
        }
        salida.end();
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    } 
}