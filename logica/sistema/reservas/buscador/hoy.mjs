import { DateTime } from "luxon";
import { conexion } from "../../../componentes/db.mjs";
import { codigoZonaHoraria } from "../../configuracion/codigoZonaHoraria.mjs";

export const hoy = async (data) => {
    try {

        const numeroPorPagina = data.numeroPorPagina
        const numeroPagina = data.numeroPagina

        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        const tiempoZH = DateTime.now().setZone(zonaHoraria);
        const fechaActualTZ = tiempoZH.toISODate();
        const dia = String(tiempoZH.day).padStart("2", "0");
        const mes = String(tiempoZH.month).padStart("2", "0");
        const ano = tiempoZH.year;
        //const numeroPagina = pagina - 1
        const fechaFormato_Humano = dia + "/" + mes + "/" + ano;
        const consultaHoy = `
                        SELECT 
                            r.reserva,
                            to_char(r.entrada, 'DD/MM/YYYY') as "fechaEntrada",
                            to_char(r.salida, 'DD/MM/YYYY') as "fechaSalida",
                            r."estadoReserva",
                            COALESCE(
                                CONCAT_WS(' ', c.nombre, c."primerApellido", c."segundoApellido"),
                                CONCAT_WS(' ', ptr."nombreTitular")
                            ) AS "nombreCompleto",
                            c.pasaporte AS "pasaporteTitular",
                            ptr."pasaporteTitular" AS "pasaporteTitular",
                            c.email AS "emailTitular",
                            ptr."emailTitular" AS "emailTitular",
                            ptr."nombreTitular" AS "nombreCompleto",
                            to_char(r.creacion, 'DD/MM/YYYY') as creacion,
                            COUNT(*) OVER() as total_filas,
                        CASE
                            WHEN ptr.uid IS NOT NULL THEN CONCAT_WS(' ', ptr."nombreTitular", '(pool)')
                            END AS "nombreCompleto"
                        FROM 
                            reservas r
                        LEFT JOIN
                            "reservaTitulares" rt ON r.reserva = rt."reservaUID"
                        LEFT JOIN 
                            clientes c ON rt."titularUID" = c.uid
                        LEFT JOIN
                            "poolTitularesReserva" ptr ON r.reserva = ptr.reserva
                        WHERE 
                            entrada = $1
                        ORDER BY 
                            "entrada" ASC
                        LIMIT $2
                        OFFSET $3;
                        `;
        const consultaReservasHoy = await conexion.query(consultaHoy, [fechaActualTZ, numeroPorPagina, numeroPagina]);
        const consultaConteoTotalFilas = consultaReservasHoy?.rows[0]?.total_filas ? consultaReservasHoy.rows[0].total_filas : 0;
        const reservasEncontradas = consultaReservasHoy.rows;
        for (const detallesFila of reservasEncontradas) {
            delete detallesFila.total_filas;
        }
        const totalPaginas = Math.ceil(consultaConteoTotalFilas / numeroPorPagina);
        const corretorNumeroPagina = String(numeroPagina).replace("0", "");
        const respuesta = {
            tipoConsulta: "rango",
            tipoCoincidencia: "porFechaDeEntrada",
            pagina: Number(1),
            fechaEntrada: fechaFormato_Humano,
            paginasTotales: totalPaginas,
            totalReservas: Number(consultaConteoTotalFilas),
            nombreColumna: "entrada",
            sentidoColumna: "ascendente",
            reservas: reservasEncontradas
        };
        return respuesta
    } catch (error) {
        throw error
    }
}