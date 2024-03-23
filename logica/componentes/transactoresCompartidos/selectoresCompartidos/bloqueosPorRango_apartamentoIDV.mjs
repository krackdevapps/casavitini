import { conexion } from "../../db.mjs"
const bloqueosPorRango_apartamentoIDV = async (metadatos) => {
    try {
        const fechaInicioRango_ISO = metadatos.fechaInicioRango_ISO
        const fechaFinRango_ISO = metadatos.fechaFinRango_ISO
        const apartamentoIDV = metadatos.apartamentoIDV || []
        const zonaBloqueo_array = metadatos.zonaBloqueo_array
        const consultaBloqueos = `
          SELECT 
          uid,
          apartamento,
          "tipoBloqueo",
          "zona",
          motivo,
          to_char(entrada, 'DD/MM/YYYY') as entrada, 
          to_char(salida, 'DD/MM/YYYY') as salida,
          to_char(entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO", 
          to_char(salida, 'YYYY-MM-DD') as "fechaSalida_ISO"  
          FROM "bloqueosApartamentos" 
          WHERE                     
          apartamento = ANY($3)
          AND
          (
           (   (
                  -- Caso 1: Evento totalmente dentro del rango
                  (entrada <= $1::DATE AND salida >= $2::DATE)
              )
              OR
              (
                  -- Caso 2: Evento parcialmente dentro del rango
                  (entrada < $1::DATE AND salida > $1::DATE)
                  OR (entrada < $2::DATE AND salida > $2::DATE)
              )
              OR
              (
                  -- Caso 3: Evento que atraviesa el rango
                  (entrada < $1::DATE AND salida > $2::DATE)
              )
              AND
              (zona = ANY($4))
              OR 
              ("tipoBloqueo" = 'permanente')
              )
          );`
        const resuelveBloqueos = await conexion.query(consultaBloqueos, [fechaInicioRango_ISO, fechaFinRango_ISO, apartamentoIDV, zonaBloqueo_array])
        return resuelveBloqueos.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
export {
    bloqueosPorRango_apartamentoIDV
}