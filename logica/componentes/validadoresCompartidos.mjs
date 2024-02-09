import { DateTime } from "luxon"
import { conexion } from "./db.mjs"
import { codigoZonaHoraria } from "./transactoresCompartidos/codigoZonaHoraria.mjs"

const validadoresCompartidos = {
    clientes: {
        nuevoCliente: async (cliente) => {
            try {
                let nombre = cliente.nombre
                let primerApellido = cliente.primerApellido
                let segundoApellido = cliente.segundoApellido
                let pasaporte = cliente.pasaporte
                let telefono = cliente.telefono
                let correoElectronico = cliente.correoElectronico
                let notas = cliente?.notas
                const filtroCadena = /^[a-zA-Z0-9\s]+$/;
                if (nombre?.length > 0) {
                    if (!filtroCadena.test(nombre)) {
                        const error = "el campo 'nombre' solo puede ser letras minúsculas, masculas."
                        throw new Error(error)
                    }
                    nombre = nombre.trim();
                    nombre = nombre.replace(/\s+/g, ' ');
                    nombre = nombre.toUpperCase();

                } else {
                    const error = "el campo 'nombre' es obligatorio."
                    throw new Error(error)
                }
                if (primerApellido?.length > 0) {
                    if (!filtroCadena.test(primerApellido)) {
                        const error = "el campo 'primerApellido' solo puede ser letras minúsculas, masculas."
                        throw new Error(error)
                    }
                    primerApellido = primerApellido.trim();
                    primerApellido = primerApellido.replace(/\s+/g, ' ');
                    primerApellido = primerApellido.toUpperCase();

                }
                if (segundoApellido?.length > 0) {
                    if (!filtroCadena.test(segundoApellido)) {
                        const error = "el campo 'segundoApellido' solo puede ser letras minúsculas, masculas."
                        throw new Error(error)
                    }
                    segundoApellido = segundoApellido.trim();
                    segundoApellido = segundoApellido.replace(/\s+/g, ' ');
                    segundoApellido = segundoApellido.toUpperCase();

                }
                if (pasaporte?.length > 0) {
                    const filtroPasaporte = /^[a-zA-Z0-9]+$/;

                    if (!filtroPasaporte.test(pasaporte)) {
                        const error = "el campo 'pasaporte' solo puede ser letras minúsculas, masculas y numeros."
                        throw new Error(error)
                    }
                    pasaporte = pasaporte.trim();
                    pasaporte = pasaporte.replace(/\s+/g, ' ');
                    pasaporte = pasaporte.toUpperCase();


                } else {
                    const error = "el campo 'pasaporte' es obligatorio."
                    throw new Error(error)
                }
                if (telefono) {
                    const filtroTelefono = /^\d+$/
                    if (!filtroTelefono.test(telefono)) {
                        const error = "el campo 'telefono' solo puede una cadena con un numero, entero y positivo. Si estas escribiendo un numero internacional, sustituya el signo mas del incio por dos ceros"
                        throw new Error(error)
                    }

                    telefono = telefono.trim();
                    telefono = telefono.replace(/\s+/g, '');
                }
                if (correoElectronico?.length > 0) {
                    const filtroCorreoElectronico = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+$/;
                    if (!filtroCorreoElectronico.test(correoElectronico)) {
                        const error = "el campo 'correoElectronico' no cumple con el formato esperado, el formado esperado es asi como usuario@servidor.com"
                        throw new Error(error)
                    }
                    correoElectronico = correoElectronico.trim();
                    correoElectronico = correoElectronico.replace(/\s+/g, '');
                    const consultaCorreo = `
                    SELECT 
                    nombre,
                    "primerApellido",
                    "segundoApellido"
                    FROM clientes
                    WHERE email = $1;
                    `
                    const resuelveUnicidadCorreo = await conexion.query(consultaCorreo, [correoElectronico])
                    if (resuelveUnicidadCorreo.rowCount > 0) {
                        const nombreClienteExistente = resuelveUnicidadCorreo.rows[0].nombre
                        const primerApellidoClienteExistente = resuelveUnicidadCorreo.rows[0].primerApellido
                        const segundoApellidoClienteExistente = resuelveUnicidadCorreo.rows[0].segundoApellido
                        const error = `Ya existe un cliente con ese correo electronico: ${nombreClienteExistente} ${primerApellidoClienteExistente} ${segundoApellidoClienteExistente}`
                        throw new Error(error)
                    }
                }
                if (notas?.length > 0) {
                    notas = notas.replace(/[^A-Za-z\s\d.,!?]/g, '');
                }

                const consultaPasaporte = `
                SELECT 
                nombre,
                "primerApellido",
                "segundoApellido"
                FROM clientes
                WHERE pasaporte = $1;
                `
                const resuelveUnicidadPasaporte = await conexion.query(consultaPasaporte, [pasaporte])

                if (resuelveUnicidadPasaporte.rowCount > 0) {
                    const nombreClienteExistente = resuelveUnicidadPasaporte.rows[0].nombre
                    const primerApellidoClienteExistente = resuelveUnicidadPasaporte.rows[0].primerApellido
                    const segundoApellidoClienteExistente = resuelveUnicidadPasaporte.rows[0].segundoApellido

                    const error = `Ya existe un cliente con ese pasaporte: ${nombreClienteExistente} ${primerApellidoClienteExistente} ${segundoApellidoClienteExistente}`
                    throw new Error(error)
                }

                const datosValidados = {
                    nombre: nombre,
                    primerApellido: primerApellido,
                    segundoApellido: segundoApellido,
                    pasaporte: pasaporte,
                    telefono: telefono,
                    correoElectronico: correoElectronico,

                }
                if (notas) {
                    datosValidados.notas = notas
                }
                return datosValidados
            } catch (error) {
                throw error
            }
        },
        actualizarCliente: async (cliente) => {

            try {
                let nombre = cliente.nombre
                let primerApellido = cliente.primerApellido
                let segundoApellido = cliente.segundoApellido
                let pasaporte = cliente.pasaporte
                let telefono = cliente.telefono
                let correoElectronico = cliente.correoElectronico
                let notas = cliente.notas
                const filtroCadena = /^[a-zA-Z0-9\s]+$/;
                if (nombre?.length > 0) {
                    if (!filtroCadena.test(nombre)) {
                        const error = "el campo 'nombre' solo puede ser letras minúsculas, masculas."
                        throw new Error(error)
                    }
                    nombre = nombre.trim();
                    nombre = nombre.replace(/\s+/g, ' ');
                    nombre = nombre.toUpperCase();

                }
                if (primerApellido?.length > 0) {
                    if (!filtroCadena.test(primerApellido)) {
                        const error = "el campo 'primerApellido' solo puede ser letras minúsculas, masculas."
                        throw new Error(error)
                    }
                    primerApellido = primerApellido.trim();
                    primerApellido = primerApellido.replace(/\s+/g, ' ');
                    primerApellido = primerApellido.toUpperCase();

                }
                if (segundoApellido?.length > 0) {
                    if (!filtroCadena.test(segundoApellido)) {
                        const error = "el campo 'segundoApellido' solo puede ser letras minúsculas, masculas."
                        throw new Error(error)
                    }
                    segundoApellido = segundoApellido.trim();
                    segundoApellido = segundoApellido.replace(/\s+/g, ' ');
                    segundoApellido = segundoApellido.toUpperCase();

                }
                if (pasaporte?.length > 0) {
                    const filtroPasaporte = /^[a-zA-Z0-9]+$/;

                    if (!filtroPasaporte.test(pasaporte)) {
                        const error = "el campo 'pasaporte' solo puede ser letras minúsculas, masculas y numeros."
                        throw new Error(error)
                    }
                    pasaporte = pasaporte.trim();
                    pasaporte = pasaporte.replace(/\s+/g, ' ');
                    pasaporte = pasaporte.toUpperCase();


                }
                if (telefono) {
                    const filtroTelefono = /^\d+$/
                    if (!filtroTelefono.test(telefono)) {
                        const error = "el campo 'telefono' solo puede una cadena con un numero, entero y positivo. Si estas escribiendo un numero internacional, sustituya el signo mas del incio por dos ceros"
                        throw new Error(error)
                    }

                    telefono = telefono.trim();
                    telefono = telefono.replace(/\s+/g, '');
                }
                if (correoElectronico?.length > 0) {
                    const filtroCorreoElectronico = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+$/;
                    if (!filtroCorreoElectronico.test(correoElectronico)) {
                        const error = "el campo 'correoElectronico' no cumple con el formato esperado, el formado esperado es asi como usuario@servidor.com"
                        throw new Error(error)
                    }
                    correoElectronico = correoElectronico.toLowerCase()
                    correoElectronico = correoElectronico.trim();
                }
                if (notas?.length > 0) {
                    notas = notas.replace(/[^A-Za-z\s\d.,!?]/g, '');
                }

                const consultaPasaporte = `
                SELECT 
                nombre,
                "primerApellido",
                "segundoApellido"
                FROM clientes
                WHERE pasaporte = $1;
                `
                const resuelveUnicidadPasaporte = await conexion.query(consultaPasaporte, [pasaporte])

                if (resuelveUnicidadPasaporte.rowCount > 0) {
                    const nombreClienteExistente = resuelveUnicidadPasaporte.rows[0].nombre
                    const primerApellidoClienteExistente = resuelveUnicidadPasaporte.rows[0].primerApellido
                    const segundoApellidoClienteExistente = resuelveUnicidadPasaporte.rows[0].segundoApellido

                    const error = `Ya existe un cliente con ese pasaporte: ${nombreClienteExistente} ${primerApellidoClienteExistente} ${segundoApellidoClienteExistente}`
                    throw new Error(error)
                }


                const consultaCorreo = `
                SELECT 
                nombre,
                "primerApellido",
                "segundoApellido"
                FROM clientes
                WHERE email = $1;
                `
                const resuelveUnicidadCorreo = await conexion.query(consultaCorreo, [correoElectronico])

                if (resuelveUnicidadCorreo.rowCount > 0) {
                    const nombreClienteExistente = resuelveUnicidadCorreo.rows[0].nombre
                    const primerApellidoClienteExistente = resuelveUnicidadCorreo.rows[0].primerApellido
                    const segundoApellidoClienteExistente = resuelveUnicidadCorreo.rows[0].segundoApellido
                    const error = `Ya existe un cliente con ese correo electronico: ${nombreClienteExistente} ${primerApellidoClienteExistente} ${segundoApellidoClienteExistente}`
                    throw new Error(error)
                }
                const datosValidados = {
                    nombre: nombre,
                    primerApellido: primerApellido,
                    segundoApellido: segundoApellido,
                    pasaporte: pasaporte,
                    telefono: telefono,
                    correoElectronico: correoElectronico,
                    notas: notas

                }
                return datosValidados
            } catch (error) {
                throw error
            }

        },
    },
    usuarios: {
        actualizarDatos: async (datosUsuario) => {
            try {

                const usuarioIDX = datosUsuario.usuarioIDX
                let nombre = datosUsuario.nombre
                let primerApellido = datosUsuario.primerApellido
                let segundoApellido = datosUsuario.segundoApellido
                let pasaporte = datosUsuario.pasaporte
                let telefono = datosUsuario.telefono
                let email = datosUsuario.email

                const filtroCantidad = /^\d+\.\d{2}$/;
                const filtro_minúsculas_Mayusculas_numeros_espacios = /^[a-zA-Z0-9\s]+$/;
                const filtro_minúsculas_numeros = /^[a-z0-9]+$/;
                const filtroNumeros = /^[0-9]+$/;

                const filtroCadenaSinEspacio = /^[a-z0-9]+$/;

                if (!usuarioIDX || !filtro_minúsculas_numeros.test(usuarioIDX)) {
                    const error = "El campo usuarioIDX solo admite minúsculas y numeros"
                    throw new Error(error)
                }

                if (nombre) {
                    nombre = nombre.trim();
                    nombre = nombre.replace(/\s+/g, "");
                    nombre = nombre.toUpperCase();
                    if (!filtro_minúsculas_Mayusculas_numeros_espacios.test(nombre)) {
                        const error = "El campo nombre solo admite mayúsculas, minúsculas, numeros y espacios"
                        throw new Error(error)
                    }
                }


                if (primerApellido) {
                    primerApellido = primerApellido.trim();
                    primerApellido = primerApellido.replace(/\s+/g, "");
                    primerApellido = primerApellido.toUpperCase();
                    if (!filtro_minúsculas_Mayusculas_numeros_espacios.test(primerApellido)) {
                        const error = "El campo primerApellido solo admite mayúsculas, minúsculas, numeros y espacios"
                        throw new Error(error)
                    }
                }

                if (segundoApellido) {
                    segundoApellido = segundoApellido.trim();
                    segundoApellido = segundoApellido.replace(/\s+/g, "");
                    segundoApellido = segundoApellido.toUpperCase();
                    if (!filtro_minúsculas_Mayusculas_numeros_espacios.test(segundoApellido)) {
                        const error = "El campo segundoApellido solo admite mayúsculas, minúsculas, numeros y espacios"
                        throw new Error(error)
                    }
                }

                if (pasaporte?.length > 0) {
                    pasaporte = pasaporte.trim();
                    pasaporte = pasaporte.replace(/\s+/g, "");
                    pasaporte = pasaporte.toUpperCase();
                    const filtroPasaporte = /^[a-zA-Z0-9]+$/;

                    if (!filtroPasaporte.test(pasaporte)) {
                        const error = "el campo 'pasaporte' solo puede ser letras minúsculas, masculas y numeros."
                        throw new Error(error)
                    }
             
                }

                if (telefono) {
                    telefono = telefono.trim();
                    telefono = telefono.replace(/\s+/g, '');
                    const filtroTelefono = /^\d+$/
                    if (!filtroTelefono.test(telefono)) {
                        const error = "el campo 'telefono' solo puede una cadena con un numero, entero y positivo. Si estas escribiendo un numero internacional, sustituya el signo mas del incio por dos ceros"
                        throw new Error(error)
                    }

              
                }

                if (email) {
                    email = email.trim();
                    email = email.replace(/\s+/g, '');
                    email = email.toLowerCase()
                    const filtroEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                    if (!filtroEmail.test(email)) {
                        const error = "El campo email no tiene le formato correcto, por ejemplo usuario@servidor.zona"
                        throw new Error(error)
                    }
         
                }

                // validar existencia de correo
                const consultaControlCorreo = `
                SELECT 
                "usuarioIDX"
                FROM "datosDeUsuario"
                WHERE email = $1;
                `
                const resuelveUnicidadCorreo = await conexion.query(consultaControlCorreo, [email])
                if (resuelveUnicidadCorreo.rowCount > 0) {
                    const usuarioExistente = resuelveUnicidadCorreo.rows[0].usuarioIDX
                    const error = `Ya existe un usuario con el correo electroníco que estas intentando guardar: ${usuarioExistente}`
                    throw new Error(error)

                }
                // validar existencia de pasaporte
                const consultaControlPasaporte = `
                    SELECT 
                    "usuarioIDX"
                    FROM "datosDeUsuario"
                    WHERE pasaporte = $1;
                    `
                const resuelveUnicidadPasaporte = await conexion.query(consultaControlPasaporte, [pasaporte])
                if (resuelveUnicidadPasaporte.rowCount > 0) {
                    const usuarioExistente = resuelveUnicidadPasaporte.rows[0].usuarioIDX
                    const error = `Ya existe un usuario con el pasaporte que estas intentando guardar: ${usuarioExistente}`
                    throw new Error(error)
                }


                const salidaValidada = {

                    usuarioIDX: usuarioIDX,
                    nombre: nombre,
                    primerApellido: primerApellido,
                    segundoApellido: segundoApellido,
                    pasaporte: pasaporte,
                    telefono: telefono,
                    email: email,
                }
                return salidaValidada

            } catch (error) {
                throw error
            }
        }
    },
    fechas: {
        validarFecha_ISO: async (fechaISO) => {
            try {
                if (typeof fechaISO !== "string") {
                    const error = "La fecha no cumple el formato cadena esperado"
                    throw new Error(error)
                }
                const filtroFecha_ISO = /^\d{4}-\d{2}-\d{2}$/;
                if (!filtroFecha_ISO.test(fechaISO)) {
                    const error = "La fecha no cumple el formato ISO esperado"
                    throw new Error(error)
                }

                const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria
                const fechaControl = DateTime.fromISO(fechaISO, { zone: zonaHoraria }).isValid;
                if (!fechaControl) {
                    const error = "LA fecha de entrada no es valida, representacion no terraquea"
                    throw new Error(error)
                }
                return "ok"
            } catch (error) {
                throw error

            }
        },
        validarFecha_Humana: async (fecha_Humana) => {
            try {
                if (typeof fecha_Humana !== "string") {
                    const error = "La fecha no cumple el formato cadena esperado"
                    throw new Error(error)
                }
                const filtroFecha_Humana = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
                if (!filtroFecha_Humana.test(fecha_Humana)) {
                    const error = "La fecha no cumple el formato Humano esperado"
                    throw new Error(error)
                }

                const fechaArreglo = fecha_Humana.split("/")

                const dia = fechaArreglo[0]
                const mes = fechaArreglo[1]
                const ano = fechaArreglo[2]

                const fecha_ISO = `${ano}-${mes}-${dia}`

                const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria
                const fechaControl = DateTime.fromISO(fecha_ISO, { zone: zonaHoraria }).isValid;
                if (!fechaControl) {
                    const error = "La fecha no es valida, representacion no terraquea"
                    throw new Error(error)
                }

                const estructura = {
                    fechaGranulada: {
                        dia: dia,
                        mes: mes,
                        ano: ano,
                    },
                    fecha_ISO: fecha_ISO

                }
                return estructura
            } catch (error) {
                throw error
            }

        }


    },
    reservas: {
        validarReserva: async (reservaUID) => {
            try {
                const filtroCadena = /^[0-9]+$/;
                if (!reservaUID || !filtroCadena.test(reservaUID)) {
                    const error = "el campo 'reservaUID' solo puede ser una cadena de letras minúsculas y numeros sin espacios."
                    throw new Error(error)
                }
                const validarReserva = `
                SELECT
                *
                FROM 
                reservas
                WHERE
                reserva = $1
                ;`
                const resuelveValidarReserva = await conexion.query(validarReserva, [reservaUID])
                if (resuelveValidarReserva.rowCount === 0) {
                    const error = "No existe la reserva comprueba es reservaUID"
                    throw new Error(error)
                }
                return resuelveValidarReserva.rows[0]
            } catch (errorCapturado) {
                throw errorCapturado
            }
        },
        resolverNombreApartamento: async (apartamentoIDV) => {
            try {
                const consultaNombreApartamento = `
                SELECT "apartamentoUI"
                FROM apartamentos 
                WHERE apartamento = $1;`
                const resolverNombreApartamento = await conexion.query(consultaNombreApartamento, [apartamentoIDV])
                if (resolverNombreApartamento.rowCount === 0) {
                    const error = "No existe el apartamentoIDV para resolver"
                    throw new new Error(error)

                }
                const apartamentoUI = resolverNombreApartamento.rows[0].apartamentoUI
                return apartamentoUI
            } catch (error) {
                throw error
            }

        }
    },



}

export {
    validadoresCompartidos
}