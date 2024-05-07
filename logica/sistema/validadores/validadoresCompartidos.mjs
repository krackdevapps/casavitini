import { DateTime } from "luxon"
import { codigoZonaHoraria } from "../codigoZonaHoraria.mjs"
import { conexion } from "../../componentes/db.mjs"
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
                const filtroCadena = /[^a-zA-Z0-9\s\-_.]/g;
                const filtroCadena_v2 = /['"\\;\r\n<>\t\b]/g;

                if (nombre?.length > 0) {
                    nombre = nombre
                        .replace(/\s+/g, ' ')
                        .toUpperCase()
                        .replace(filtroCadena, '')
                        .replace(filtroCadena_v2, '')
                        .trim()

                    if (nombre.length === 0) {
                        const error = "Revisa el nombre, ningun caracter escrito en el campo pasaporte es valido"
                        throw new Error(error)
                    }

                } else {
                    const error = "El nombre del cliente es obligatorio."
                    throw new Error(error)
                }
                if (primerApellido?.length > 0) {
                    primerApellido = primerApellido
                        .replace(/\s+/g, ' ')
                        .toUpperCase()
                        .replace(filtroCadena_v2, '')
                        .trim()

                }
                if (segundoApellido?.length > 0) {
                    segundoApellido = segundoApellido
                        .replace(/\s+/g, ' ')
                        .toUpperCase()
                        .replace(filtroCadena_v2, '')
                        .trim()

                }
                if (pasaporte?.length > 0) {
                    pasaporte = pasaporte
                        .replace(/\s+/g, ' ')
                        .toUpperCase()
                        .replace(filtroCadena_v2, '')
                        .trim()

                    if (pasaporte.length === 0) {
                        const error = "Revisa el pasaprote, ningun caracter escrito en el campo pasaporte es valido"
                        throw new Error(error)
                    }

                } else {
                    const error = "Escribe el pasaporte, es obligatorio."
                    throw new Error(error)
                }
                if (telefono) {
                    const filtroTelefono = /[^0-9]+/g
                    telefono = telefono
                        .replace(filtroTelefono, '')
                        .replace(filtroCadena_v2, '')
                        .trim()

                }
                if (correoElectronico?.length > 0) {
                    const filtroCorreoElectronico = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+$/;
                    if (!filtroCorreoElectronico.test(correoElectronico)) {
                        const error = "el campo 'correoElectronico' no cumple con el formato esperado, el formado esperado es asi como usuario@servidor.com"
                        throw new Error(error)
                    }
                    correoElectronico = correoElectronico
                        .replace(/\s+/g, '')
                        .replace(filtroCadena_v2, '')
                        .trim()

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
                    notas = notas
                        .replace(/[^A-Za-z\s\d.,!?]/g, '')
                        .replace(filtroCadena_v2, '')
                        .trim()

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
                const filtroCadena_v2 = /['"\\;\r\n<>\t\b]/g;

                if (nombre?.length > 0) {
                    nombre = nombre
                        .replace(/\s+/g, ' ')
                        .toUpperCase()
                        .replace(filtroCadena, '')
                        .replace(filtroCadena_v2, '')
                        .trim()
                }
                if (primerApellido?.length > 0) {
                    primerApellido = primerApellido
                        .replace(/\s+/g, ' ')
                        .toUpperCase()
                        .replace(filtroCadena_v2, '')
                        .trim()
                }
                if (segundoApellido?.length > 0) {
                    segundoApellido = segundoApellido
                        .replace(/\s+/g, ' ')
                        .toUpperCase()
                        .replace(filtroCadena_v2, '')
                        .trim()

                }
                if (pasaporte?.length > 0) {
                    pasaporte = pasaporte
                        .replace(/\s+/g, ' ')
                        .toUpperCase()
                        .replace(filtroCadena_v2, '')
                        .trim()
                }
                if (telefono) {
                    const filtroTelefono = /[^0-9]+/g
                    telefono = telefono
                        .replace(filtroTelefono, '')
                        .replace(filtroCadena_v2, '')
                        .trim()
                }
                if (correoElectronico?.length > 0) {
                    const filtroCorreoElectronico = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+$/;
                    if (!filtroCorreoElectronico.test(correoElectronico)) {
                        const error = "el campo 'correoElectronico' no cumple con el formato esperado, el formado esperado es asi como usuario@servidor.com"
                        throw new Error(error)
                    }
                    correoElectronico = correoElectronico
                        .replace(/\s+/g, '')
                        .replace(filtroCadena_v2, '')
                        .trim()

                }
                if (notas?.length > 0) {
                    notas = notas
                        .replace(/[^A-Za-z\s\d.,!?]/g, '')
                        .replace(filtroCadena_v2, '')
                        .trim()
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
        unicidadPasaporteYCorrreo: async (datosUsuario) => {
            try {
                const usuarioIDX = datosUsuario.usuarioIDX
                const pasaporte = datosUsuario.pasaporte
                const email = datosUsuario.email

                // validar existencia de correo
                const consultaControlCorreo = `
                SELECT 
                "usuarioIDX"
                FROM "datosDeUsuario"
                WHERE email = $1 AND "usuariosIDX" <> $2;
                `
                const resuelveUnicidadCorreo = await conexion.query(consultaControlCorreo, [email, usuarioIDX])
                if (resuelveUnicidadCorreo.rowCount > 0) {
                    const usuariosExistentes = resuelveUnicidadCorreo.rows.map((usuario) => {
                        return usuario.usuarioIDX
                    })
                    const ultimoElemento = usuariosExistentes.pop();
                    const constructorCadenaFinalUI = usuariosExistentes.join(", ") + (usuariosExistentes.length > 0 ? " y " : "") + ultimoElemento;
                    const error = `Ya existe un usuario con el correo electroníco que estas intentando guardar: ${constructorCadenaFinalUI}`
                    throw new Error(error)
                }
                // validar existencia de pasaporte
                const consultaControlPasaporte = `
                    SELECT 
                    "usuarioIDX"
                    FROM "datosDeUsuario"
                    WHERE pasaporte = $1 AND "usuariosIDX" <> $2;
                    `
                const resuelveUnicidadPasaporte = await conexion.query(consultaControlPasaporte, [pasaporte, usuarioIDX])
                if (resuelveUnicidadPasaporte.rowCount > 0) {
                    const usuariosExistentes = resuelveUnicidadPasaporte.rows.map((usuario) => {
                        return usuario.usuarioIDX
                    })
                    const ultimoElemento = usuariosExistentes.pop();
                    const constructorCadenaFinalUI = usuariosExistentes.join(", ") + (usuariosExistentes.length > 0 ? " y " : "") + ultimoElemento;
                    const error = `Ya existe un usuario con el pasaporte que estas intentando guardar: ${constructorCadenaFinalUI}`
                    throw new Error(error)
                }

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
                return true
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
                //const fechaControl = DateTime.fromISO(fecha_ISO, { zone: zonaHoraria }).isValid;
                const fechaControl = DateTime.fromObject({
                    day: dia,
                    month: mes,
                    year: ano
                }, { zone: zonaHoraria }).isValid;
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
        },
        fechaMesAno: async (fechaMesAno) => {
            try {
                if (typeof fechaMesAno !== "string") {
                    const error = "La fecha no cumple el formato cadena esperado"
                    throw new Error(error)
                }
                //Ojo por que esto es nes-ano:
                const filtroFecha = /^([1-9]|1[0-2])-(\d{1,})$/;
                if (!filtroFecha.test(fechaMesAno)) {
                    const error = "La fecha no cumple el formato especifico. En este caso se espera una cadena con este formado MM-YYYY, si el mes tiene un digio, es un digito, sin el cero delante. Por ejemplo 5-2024 o 10-2024";
                    throw new Error(error);
                }
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
    claves: {
        minimoRequisitos: (clave) => {
            try {
                if (!clave &&
                    typeof clave !== "srting" &&
                    clave.length < 12) {
                    const error = "La contraseña debe de tener un minimo de 12 caracteres"
                    throw new Error(error)
                }
                let tieneMayuscula = false;
                let tieneNumero = false;
                let tieneCaracterEspecial = false;
                // Verifica cada carácter de la clave
                for (var i = 0; i < clave.length; i++) {
                    var caracter = clave.charAt(i);
                    // Verifica si el carácter es una mayúscula
                    if (caracter >= "A" && caracter <= "Z") {
                        tieneMayuscula = true;
                    }
                    // Verifica si el carácter es un número
                    else if (caracter >= "0" && caracter <= "9") {
                        tieneNumero = true;
                    }
                    // Verifica si el carácter es un carácter especial
                    else if ("!@#$%^&*()_+".indexOf(caracter) !== -1) {
                        tieneCaracterEspecial = true;
                    }
                }
                if (!tieneMayuscula) {
                    const error = "Por favor ponga como minimo una mayuscula en su contraseña"
                    throw new Error(error)
                }
                if (!tieneNumero) {
                    const error = "Por favor ponga como minimo un numero en su contraseña"
                    throw new Error(error)
                }
                if (!tieneCaracterEspecial) {
                    const error = "Por favor ponga como minimo un caracter especial en su contraseña, como por ejemplo: ! @ # $ % ^ & * ( ) _ +"
                    throw new Error(error)
                }
            } catch (errorCapturado) {
                throw errorCapturado
            }
        }
    },
    tipos: {
        cadena: (configuracion) => {
            let string = configuracion.string
            const nombreCampo = configuracion.nombreCampo
            const filtro = configuracion.filtro
            const sePermiteVacio = configuracion.sePermiteVacio
            const limpiezaEspaciosAlrededor = configuracion.limpiezaEspaciosAlrededor
            const limpiezaEspaciosInternos = configuracion.limpiezaEspaciosInternos || "no"
            const limpiezaEspaciosInternosGrandes = configuracion.limpiezaEspaciosInternosGrandes || "no"
            const soloMinusculas = configuracion.soloMinusculas || "no"
            const soloMayusculas = configuracion.soloMayusculas || "no"

            if (!nombreCampo) {
                const mensaje = `El validador de cadenas, necesito un nombre de campo.`
                throw new Error(mensaje)
            }
            if (typeof string !== "string") {
                const mensaje = `${nombreCampo} debe de ser una cadena.`
                throw new Error(mensaje)
            }
            if (typeof sePermiteVacio !== "string" &&
                (sePermiteVacio !== "si" && sePermiteVacio !== "no")) {
                const mensaje = `El validor de cadena esta mal configurado, sePermiteVacio solo acepta si o no y es obligatorio declararlo en la configuracíon.`
                throw new Error(mensaje)
            }
            if (typeof limpiezaEspaciosAlrededor !== "string" &&
                (limpiezaEspaciosAlrededor !== "si" && limpiezaEspaciosAlrededor !== "no")) {
                const mensaje = `El validor de cadena esta mal configurado, limpiezaEspaciosAlrededor solo acepta si o no.`
                throw new Error(mensaje)
            }
            if (limpiezaEspaciosInternos &&
                typeof limpiezaEspaciosInternos !== "string" &&
                (limpiezaEspaciosInternos !== "si" && limpiezaEspaciosInternos !== "no")) {
                const mensaje = `El validor de cadena esta mal configurado, limpiezaEspaciosInternos solo acepta si o no.`
                throw new Error(mensaje)
            }
            if (limpiezaEspaciosInternos === "si") {
                string = string.replaceAll(" ", "")
            }

            if (limpiezaEspaciosInternosGrandes &&
                typeof limpiezaEspaciosInternosGrandes !== "string" &&
                (limpiezaEspaciosInternosGrandes !== "si" && limpiezaEspaciosInternosGrandes !== "no")) {
                const mensaje = `El validor de cadena esta mal configurado, limpiezaEspaciosInternosGrandes solo acepta si o no.`
                throw new Error(mensaje)
            }
            if (limpiezaEspaciosInternosGrandes === "si") {
                string = string.replace(/\s+/g, " ");
            }

            if (soloMinusculas &&
                typeof soloMayusculas !== "string" &&
                (soloMinusculas !== "si" && soloMinusculas !== "no")) {
                const mensaje = `El validor de cadena esta mal configurado, soloMinusculas solo acepta si o no.`
                throw new Error(mensaje)
            }
            if (soloMayusculas !== "si" && soloMayusculas !== "no") {
                const mensaje = `El validor de cadena esta mal configurado, soloMayusculas solo acepta si o no.`
                throw new Error(mensaje)
            }
            if (sePermiteVacio === "si" && string === "") {
                return string
            }
            if (string.length === 0 || string === "") {
                const mensaje = `${nombreCampo} esta vacío.`
                throw new Error(mensaje)
            }
            if (limpiezaEspaciosAlrededor === "si") {
                string = string
                    .replace(/\s+/g, ' ')
                    .trim()
            }
            if (soloMinusculas === "si") {
                string = string
                    .toLowerCase()
            }
            if (soloMayusculas === "si") {
                string = string
                    .toLowerCase()
            }
            if (filtro === "strictoSinEspacios") {
                try {
                    const filtro = /^[a-zA-Z0-9_\-\/\.]+$/;
                    if (!filtro.test(string)) {
                        const mensaje = `${nombreCampo} solo acepta una cadena de mayusculas, minusculas, numeros y los siguientes caracteres: _, -, . y /`
                        throw new Error(mensaje)
                    }
                } catch (errorCapturado) {
                    throw errorCapturado
                }
            } else if (filtro === "strictoIDV") {
                try {
                    const filtro = /^[a-zA-Z0-9]+$/;
                    if (!filtro.test(string)) {
                        const mensaje = `${nombreCampo} solo acepta una cadena de mayusculas, minusculas y numeros.`
                        throw new Error(mensaje)
                    }
                } catch (errorCapturado) {
                    throw errorCapturado
                }
            } else if (filtro === "strictoConEspacios") {
                try {
                    const filtro = /^[a-zA-Z0-9_\s\-\/\.,:\u00F1ñ]+$/;
                    if (!filtro.test(string)) {
                        const mensaje = `${nombreCampo} solo acepta una cadena de mayusculas, minusculas, numeros, espacios y los siguientes caracteres: _, -, . y /`
                        throw new Error(mensaje)
                    }

                } catch (errorCapturado) {
                    throw errorCapturado
                }
            } else if (filtro === "sustitucionSinEspacios") {
                const string = this.string
                const filtro = /[^a-zA-Z0-9_\-\/\.]/g;
                stringLimpio = string.replace(filtro, '');
            } else if (filtro === "sustitucionConEspacios") {
                const string = this.string
                const filtro = /^[a-zA-Z0-9_ \-\/\.]+$/;
                stringLimpio = string.replace(filtro, '');
            } else if (filtro === "cadenaConNumerosConDosDecimales") {
                try {
                    const filtro = /^\d+\.\d{2}$/
                    if (!filtro.test(string)) {
                        const mensaje = `${nombreCampo} solo acepta una cadena con numeros con dos decimales separados por punto, por ejemplo 00.00`
                        throw new Error(mensaje)
                    }
                    const devuelveUnTipoNumber = configuracion.devuelveUnTipoNumber
                    if (typeof devuelveUnTipoNumber !== "string" &&
                        (devuelveUnTipoNumber !== "si" && devuelveUnTipoNumber !== "no")) {
                        const mensaje = `El validor de cadena esta mal configurado, devuelveUnTipoNumber solo acepta si o no.`
                        throw new Error(mensaje)
                    }
                    if (devuelveUnTipoNumber === "si") {
                        string = Number(string)
                    }

                } catch (errorCapturado) {
                    throw errorCapturado
                }
            } else if (filtro === "cadenaConNumerosEnteros") {
                try {
                    const filtro = /^[0-9]+$/
                    if (!filtro.test(string)) {
                        const mensaje = `${nombreCampo} solo acepta una cadena con numeros con dos decimales separados por punto, por ejemplo 00.00`
                        throw new Error(mensaje)
                    }
                    const devuelveUnTipoNumber = configuracion.devuelveUnTipoNumber
                    if (typeof devuelveUnTipoNumber !== "string" &&
                        (devuelveUnTipoNumber !== "si" && devuelveUnTipoNumber !== "no")) {
                        const mensaje = `El validor de cadena esta mal configurado, devuelveUnTipoNumber solo acepta si o no.`
                        throw new Error(mensaje)
                    }
                    if (devuelveUnTipoNumber === "si") {
                        string = Number(string)
                    }

                } catch (errorCapturado) {
                    throw errorCapturado
                }
            } else if (filtro === "cadenaBase64") {
                try {
                    const filtro = /^[A-Za-z0-9+/=]+$/
                    if (!filtro.test(string)) {
                        const mensaje = `${nombreCampo} solo acepta una cadena en base 64`
                        throw new Error(mensaje)
                    }
                } catch (errorCapturado) {
                    throw errorCapturado
                }
            } else if (filtro === "url") {
                try {
                    const filtro = /^[A-Za-z0-9_\-/=:]*$/;
                    if (!filtro.test(string)) {
                        const mensaje = `${nombreCampo} solo acepta una cadena de minusculas, mayusculas, numeros y estos caracteres: _, \, -, /, = y :`
                        throw new Error(mensaje)
                    }
                } catch (errorCapturado) {
                    throw errorCapturado
                }
            }
            else {
                const mensaje = `El validador de cadenas, necesito un identificador de filtro valido`
                throw new Error(mensaje)
            }
            return string
        },

        numero: (configuracion) => {

            let number = configuracion.number
            const nombreCampo = configuracion.nombreCampo
            const filtro = configuracion.filtro
            const sePermiteVacio = configuracion.sePermiteVacio
            const limpiezaEspaciosAlrededor = configuracion.limpiezaEspaciosAlrededor
            const sePermitenNegativos = configuracion.sePermitenNegativos || "no"

            if (!nombreCampo) {
                const mensaje = `El validador de cadenas, necesito un nombre de campo.`
                throw new Error(mensaje)
            }
            if (typeof number !== "number") {
                const mensaje = `${nombreCampo} debe de ser un numero.`
                throw new Error(mensaje)
            }
            if (typeof sePermiteVacio !== "string" &&
                (sePermiteVacio !== "si" && sePermiteVacio !== "no")) {
                const mensaje = `El validor de cadena esta mal configurado, sePermiteVacio solo acepta si o no y es obligatorio declararlo en la configuracíon.`
                throw new Error(mensaje)
            }

            if (typeof limpiezaEspaciosAlrededor !== "string" &&
                (limpiezaEspaciosAlrededor !== "si" && limpiezaEspaciosAlrededor !== "no")) {
                const mensaje = `El validor de cadena esta mal configurado, limpiezaEspaciosAlrededor solo acepta si o no.`
                throw new Error(mensaje)
            }

            if (sePermitenNegativos &&
                typeof sePermitenNegativos !== "string" &&
                (sePermitenNegativos !== "si" && sePermitenNegativos !== "no")) {
                const mensaje = `El validor de numero esta mal configurado, sePermitenNegativos solo acepta si o no.`
                throw new Error(mensaje)
            }
            if (sePermitenNegativos === "no") {
                if (number < 0) {
                    const mensaje = `No se permiten numeros negativos, por favor revisalo.`
                    throw new Error(mensaje)
                }
            }

            if (filtro === "numeroSimple") {
                try {
                    const filtro = /^[0-9]+$/;
                    if (!filtro.test(number)) {
                        const mensaje = `${nombreCampo} solo acepta numeros`
                        throw new Error(mensaje)
                    }

                } catch (errorCapturado) {
                    throw errorCapturado
                }

            } else {
                const mensaje = `El validador de numeros, necesito un identificador de filtro valido`
                throw new Error(mensaje)

            }
            return number


        },
        correoElectronico: (correoElectronico) => {
            try {
                if (!correoElectronico) {
                    const error = "El campo de correo electroníco está vacío."
                    throw new Error(error)
                }
                if (typeof correoElectronico !== "string") {
                    const error = "El campo de correo electroníco debe de ser una cadena"
                    throw new Error(error)
                }
                const filtroCorreoElectronico = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+$/;
                const cadenaCorreoLimpia = correoElectronico
                    .trim()
                    .toLowerCase()
                if (!filtroCorreoElectronico.test(cadenaCorreoLimpia)) {
                    const error = "El campo de correo electroníco no cumple con el formato esperado, el formato esperado es asi como usuario@servidor.com"
                    throw new Error(error)
                }
                return cadenaCorreoLimpia
            } catch (error) {
                throw error
            }

        },
        telefono: (telefono) => {
            try {
                if (!telefono) {
                    const error = "El campo del telefono está vacío."
                    throw new Error(error)
                }
                if (typeof telefono !== "string") {
                    const error = "el campo Telefono debe de ser una cadena."
                    throw new Error(error)
                }
                const filtroTelefono = /[^0-9]+/g
                const telefonoLimpio = telefono
                    .replace(/\s+/g, '')
                    .replace("+", '00')
                    .trim()

                if (!filtroTelefono.test(telefonoLimpio)) {
                    const error = "el campo Telefono no cumple con el formato esperado, el formado esperado es una cadena con numeros"
                    throw new Error(error)
                }
                return telefonoLimpio
            } catch (error) {
                throw error
            }
        },
        array: (configuracion) => {
            try {
                const array = configuracion.array
                const nombreCampo = configuracion.nombreCampo
                const filtro = configuracion.filtro

                if (!nombreCampo) {
                    const mensaje = `El validador de arrays, necesito un nombre de campo.`
                    throw new Error(mensaje)
                }
                //verificar que es un array
                // verificar que el array no esta vacio
                if (!array.isArray(cajon) || cajon == null || cajon === undefined) {
                    const error = `${nombreCampo} se esperaba un array`;
                    throw new Error(error);
                }
                if (array.length === 0) {
                    const error = `${nombreCampo} está array vacío`;
                    throw new Error(error);
                }
                if (filtro === "soloCadenas") {
                    array.every((cadena, index) => {
                        validadoresCompartidos.tipos.cadena({
                            string: cadena,
                            nombreCampo: `En la posicion ${index} del array debe haber una cadena`,
                            filtro: "strictoIDV",
                            sePermiteVacio: "no",
                        })
                    });
                }
            } catch (error) {
                throw error
            }
        },
    }
}
export {
    validadoresCompartidos
}