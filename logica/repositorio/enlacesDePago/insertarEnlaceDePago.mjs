import { conexion } from "../../componentes/db.mjs";
export const insertarEnlaceDePago = async (data) => {
    try {

        const nombreEnlace = data.nombreEnlace
        const reservaUID = data.reservaUID
        const descripcion = data.descripcion
        const fechaDeCaducidad = data.fechaDeCaducidad
        const cantidad = data.cantidad
        const codigoAleatorioUnico = data.codigoAleatorioUnico
        const estadoPagoInicial = data.estadoPagoInicial
        const enlaceTVI = data.enlaceTVI
        const consulta = `
        INSERT INTO "enlacesDePago"
        (
        "nombreEnlace",
        "reservaUID",
        descripcion,
        "fechaCaducidad",
        cantidad,
        codigo,
        "estadoPagoIDV",
        "enlaceTVI"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        RETURNING
        *
        `;
        const parametros = [
            nombreEnlace,
            reservaUID,
            descripcion,
            fechaDeCaducidad,
            cantidad,
            codigoAleatorioUnico,
            estadoPagoInicial,
            enlaceTVI
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha insertado el enalce pago";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

