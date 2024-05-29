import { conexion } from "../../../componentes/db.mjs";

export const obtenerOfertasPorRangoPorEstado = async (data) => {
    try {

        const fechaSalidaReserva_ISO = data.fechaSalidaReserva_ISO
        const fechaEntradaReserva_ISO = data.fechaEntradaReserva_ISO
        const estadoOferta = "activado"

        const consulta = `
        SELECT 
        "ofertaUID",
        "nombreOferta",
        to_char("fechaInicio", 'YYYY-MM-DD') as "fechaInicio", 
        to_char("fechaFinal", 'YYYY-MM-DD') as "fechaFinal", 
        "condicionesArray",
        "descuentosArray"
        FROM
        ofertas 
        WHERE                     
        (
            (
                -- Caso 1: Evento totalmente dentro del rango
                "fechaInicio" >= $1::DATE AND "fechaFinal" <= $2::DATE
            )
            OR
            (
                -- Caso 2: Evento parcialmente dentro del rango
                ("fechaInicio" < $1::DATE AND "fechaFinal" > $1::DATE)
                OR 
                ("fechaInicio" < $2::DATE AND "fechaFinal" > $2::DATE)
            )
            OR
            (
                -- Caso 3: Evento atraviesa el rango
                "fechaInicio" < $1::DATE AND "fechaFinal" > $2::DATE
            )
        )
                AND estado = $3::text
        ;`
        const parametros = [
            fechaSalidaReserva_ISO,
            fechaEntradaReserva_ISO,
            estadoOferta
        ]
        const resuelve = await conexion.query(consulta, parametros)
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
