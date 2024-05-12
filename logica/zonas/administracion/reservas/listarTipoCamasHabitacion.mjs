import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";

export const listarTipoCamasHabitacion = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const apartamento = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamento,
            nombreCampo: "El apartamento",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const habitacion = validadoresCompartidos.tipos.cadena({
            string: entrada.body.habitacion,
            nombreCampo: "El habitacion",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const consultaControlApartamento = `
                        SELECT uid 
                        FROM "configuracionHabitacionesDelApartamento" 
                        WHERE apartamento = $1;`;
        const controlConfiguracionApartamento = await conexion.query(consultaControlApartamento, [apartamento]);
        if (controlConfiguracionApartamento.rowCount === 0) {
            const error = "Ya no existe el apartamento como una configuración del apartamento. Si deseas volver a usar este apartamento, vuelve a crear la configuración del apartamento con el identificador visual: " + apartamento;
            throw new Error(error);
        }

        const consultaControlCamaDelApartamento = `
                        SELECT uid 
                        FROM "configuracionHabitacionesDelApartamento" 
                        WHERE apartamento = $1 AND habitacion = $2;`;
        const controlConfiguracionCama = await conexion.query(consultaControlCamaDelApartamento, [apartamento, habitacion]);


        if (controlConfiguracionCama.rowCount === 0) {
            const error = `Dentro de la configuración de este apartamento ya no esta disponible esta habitación para seleccionar. Para recuperar esta habitación en la configuración de alojamiento, crea una habitación como entidad con el identificador visual ${habitacion} y añádela a la configuración del apartamento con el identificar visual ${apartamento}`;
            throw new Error(error);
        }
        

        if (controlConfiguracionApartamento.rowCount > 0) {
            

            const configuracionApartamento = controlConfiguracionApartamento.rows[0]["uid"];

            const consultaControlApartamento = `
                            SELECT cama
                            FROM "configuracionCamasEnHabitacion" 
                            WHERE habitacion = $1;`;
            const configuracionCamasHabitacion = await conexion.query(consultaControlApartamento, [configuracionApartamento]);
            if (configuracionCamasHabitacion.rowCount === 0) {
                const error = "No existe ningun tipo de camas configuradas para esta habitacion";
                throw new Error(error);
            }
            

            const camasResueltas = [];
            for (const camaPorResolver of configuracionCamasHabitacion.rows) {
                const camaIDV = camaPorResolver.cama;
                const consultaResolucionNombresCamas = `
                                SELECT "camaUI", cama
                                FROM camas 
                                WHERE cama = $1;`;
                const resolucionNombresCamas = await conexion.query(consultaResolucionNombresCamas, [camaIDV]);
                const nombresCamas = resolucionNombresCamas.rows[0];
                const camaResuelta = {
                    cama: nombresCamas.cama,
                    camaUI: nombresCamas.camaUI
                };
                camasResueltas.push(camaResuelta);
            }

            const ok = {
                camasDisponibles: camasResueltas
            }
            salida.json(ok);
        }

    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}