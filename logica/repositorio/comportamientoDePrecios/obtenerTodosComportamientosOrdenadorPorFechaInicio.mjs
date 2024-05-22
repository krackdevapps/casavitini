import { conexion } from "../../componentes/db.mjs";
export const obtenerComportamientosOrdenadorPorFechaInicio = async () => {
    try {

        const consulta =  `
        SELECT
        "nombreComportamiento",
        uid,
        to_char("fechaInicio", 'DD/MM/YYYY') as "fechaInicio", 
        to_char("fechaFinal", 'DD/MM/YYYY') as "fechaFinal",
        explicacion,
        estado,
        tipo,
        "diasArray"
        FROM 
        "comportamientoPrecios"
        ORDER BY 
        "fechaInicio" ASC;
        `;

        const resuelve = await conexion.query(consulta);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
