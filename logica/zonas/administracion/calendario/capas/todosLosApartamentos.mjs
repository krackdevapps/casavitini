import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { eventosTodosLosApartamentos } from "../../../../sistema/calendarios/capas/eventosTodosLosApartamentos.mjs";

export const todosLosApartamentos = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return
        
        const fecha = entrada.body.fecha;
        const filtroFecha = /^([1-9]|1[0-2])-(\d{1,})$/;
        if (!filtroFecha.test(fecha)) {
            const error = "La fecha no cumple el formato especifico para el calendario. En este caso se espera una cadena con este formado MM-YYYY, si el mes tiene un digio, es un digito, sin el cero delante.";
            throw new Error(error);
        }
        const eventos = await eventosTodosLosApartamentos(fecha);
        const ok = {
            ok: "Aqui tienes todos los apartamentos de este mes",
            ...eventos
        };
        salida.json(ok);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        return salida.json(error);
    }
}