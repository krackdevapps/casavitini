import { conexion } from "../../../../componentes/db.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../../sistema/error/filtroError.mjs";
import { obtenerNombreApartamentoUI } from "../../../../repositorio/arquitectura/obtenerNombreApartamentoUI.mjs";

export const obtenerCalendarios = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const plataformaCalendarios = validadoresCompartidos.tipos.cadena({
            string: entrada.body.plataformaCalendarios,
            nombreCampo: "plataformaCalendarios",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const ok = {
            ok: []
        };
        const consultaConfiguracion = `
                                    SELECT 
                                    uid,
                                    nombre,
                                    url,
                                    "apartamentoIDV",
                                    "plataformaOrigen",
                                    "uidPublico"
                                    FROM 
                                    "calendariosSincronizados"
                                    WHERE
                                    "plataformaOrigen" = $1
                                    `;
        const resuelveCalendariosSincronizados = await conexion.query(consultaConfiguracion, [plataformaCalendarios]);
        if (resuelveCalendariosSincronizados.rowCount > 0) {
            for (const detallesDelCalendario of resuelveCalendariosSincronizados.rows) {
                const apartamentoIDV = detallesDelCalendario.apartamentoIDV;
                const apartamentoUI = await obtenerNombreApartamentoUI(apartamentoIDV);
                detallesDelCalendario.apartamentoUI = apartamentoUI;
            }
            ok.ok = resuelveCalendariosSincronizados.rows;
        }
        salida.json(ok);
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }

}