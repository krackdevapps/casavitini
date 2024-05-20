import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs"
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs"
import { filtroError } from "../../../sistema/error/filtroError.mjs";
import { obtenerClientesPorMail } from "../../../repositorio/clientes/obtenerClientesPorMail.mjs";
import { obtenerTitularReservaPorClienteUID_array } from "../../../repositorio/reservas/titulares/obtenerTitularReservaPorClienteUID.mjs";
import { obtenerTitularReservaPoolPorMail } from "../../../repositorio/reservas/titulares/obtenerTitularReservaPoolPorMail.mjs";
import { obtenerReservasComoLista } from "../../../repositorio/miCasa/reservas/obtenerReservasComoLista.mjs";

export const listarMisReservas = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.control()

        const usuario = entrada.session.usuario
        const paginaActual = validadoresCompartidos.tipos.numero({
            number: entrada.body.pagina,
            nombreCampo: "El numero de página",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        const nombreColumna = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nombreColumna,
            nombreCampo: "El campo del nombre de la columna",
            filtro: "strictoConEspacios",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
        })

        const sentidoColumna = validadoresCompartidos.tipos.cadena({
            string: entrada.body.sentidoColumna,
            nombreCampo: "El campo del sentido de la columna",
            filtro: "strictoConEspacios",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
        if (nombreColumna) {
            const nombreColumnaVirtual = [
                'nombreCompleto',
                'pasaporteTitular',
                'emailTitular'
            ]
            if (nombreColumnaVirtual.includes(nombreColumna)) {
                const error = "No existe el nombre de la columna que quieres ordenar";
                throw new Error(error);
            } else {
                await validadoresCompartidos.baseDeDatos.validarNombreColumna({
                    nombreColumna: nombreColumna,
                    table: "reservas"
                })
            }
            validadoresCompartidos.filtros.sentidoColumna(sentidoColumna)
        }

        const paginaActualSQL = Number((paginaActual - 1) + "0");
        const numeroPorPagina = 10;
        // Comprobar si la cuenta tiene un email
        const datosDelUsuario = await obtenerDatosPersonales(usuario)
        const usuarioMail = datosDelUsuario.mail;
        if (!usuarioMail) {
            const error = "Se necesita que definas tu dirección de correo elecroníco en Mis datos dentro de tu cuenta. Las reservas se asocian a tu cuenta mediante la dirección de correo eletroníco que usastes para confirmar la reserva. Es decir debes de ir a Mis datos dentro de tu cuenta, escribir tu dirección de correo electronico y confirmarlo con el correo de confirmacion que te enviaremos. Una vez hecho eso podras ver tus reservas";
            throw new Error(error);
        }
        // Comporbar si el email esta verificado

        const cuentaUsuario = await obtenerUsuario(usuario)
        const estadoCuentaVerificada = cuentaUsuario.cuentaVerificada;
        if (estadoCuentaVerificada !== "si") {
            const error = "Tienes que verificar tu dirección de correo electronico para poder acceder a las reservas asociadas a tu direcíon de correo electroníco.";
            throw new Error(error);
        }
        // Buscar el email verificado, en titulares poll y titulares vitini
        const clientesPorMail = await obtenerClientesPorMail(usuarioMail)
        const clientesUID = clientesPorMail.map((detallesDelCliente) => {
            return detallesDelCliente.clienteUID
        });
        // Ojo por que puede que se deba pasar el numero en number y no en cadena
        const titulares = await obtenerTitularReservaPorClienteUID_array(clientesUID)

        const reservasUID = titulares.map((detallesTitular) => {
            return detallesTitular.reservaUID
        })
        const titularesPool = await obtenerTitularReservaPoolPorMail(usuarioMail)
        for (const reservaUID of titularesPool) {
            reservasUID.push(reservaUID.reserva);
        }

        // extraer las reservasa asociadas a esos titulares  
        const listaReservas = await obtenerReservasComoLista({
            reservasUID: reservasUID,
            numeroPorPagina: numeroPorPagina,
            paginaActualSQL: paginaActualSQL,
            sentidoColumna: sentidoColumna,
            nombreColumna: nombreColumna

        })
        const consultaConteoTotalFilas = listaReservas[0]?.total_filas ? listaReservas[0].total_filas : 0;
        if (listaReservas.length === 0) {
            const error = `No hay ninguna reserva realizada y confirmada con la dirección de correo electronico ${usuarioMail}`;
            throw new Error(error);
        }
        for (const detallesFila of listaReservas) {
            delete detallesFila.total_filas;
        }
        const totalPaginas = Math.ceil(consultaConteoTotalFilas / numeroPorPagina);
        const ok = {
            ok: "Aqui tienes tus reservas",
            pagina: Number(paginaActual),
            paginasTotales: totalPaginas,
            totalReservas: Number(consultaConteoTotalFilas),
        };
        if (nombreColumna) {
            ok.nombreColumna = nombreColumna;
            ok.sentidoColumna = sentidoColumna;
        }
        ok.reservas = listaReservas;
        salida.json(ok);

    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}