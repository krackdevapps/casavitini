import { conexion } from "../../componentes/db.mjs";
export const insertarCliente = async (nuevoCliente) => {
    try {
        const nombre = nuevoCliente.nombre
        const primerApellido = nuevoCliente.primerApellido
        const segundoApellido = nuevoCliente.segundoApellido
        const pasaporte = nuevoCliente.pasaporte
        const telefono = nuevoCliente.telefono
        const correoElectronico = nuevoCliente.correoElectronico
        const notas = nuevoCliente.notas

        const insertarCliente = `
        INSERT INTO 
        clientes
        (
        nombre,
        "primerApellido",
        "segundoApellido",
        pasaporte,
        telefono,
        mail,
        notas
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7) 
        RETURNING
        *
        `
        const datosClientes = [
            nombre,
            primerApellido,
            segundoApellido,
            pasaporte,
            telefono,
            correoElectronico,
            notas
        ]
        const resuelve = await conexion.query(insertarCliente, datosClientes)
        return resuelve.rows[0]

    } catch (errorCapturado) {
        throw errorCapturado
    }
}
