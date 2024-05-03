import { DateTime } from "luxon";
import { conexion } from "../../../componentes/db.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerDetallesOferta } from "../../../sistema/sistemaDeOfertas/obtenerDetallesOferta.mjs";


export const actualizarOferta = async (entrada, salida) => {
    await mutex.acquire();
    try {
        let nombreOferta = entrada.body.nombreOferta;
        const fechaInicio = entrada.body.fechaInicio;
        const fechaFin = entrada.body.fechaFin;
        const tipoOferta = entrada.body.tipoOferta;
        const ofertaUID = entrada.body.ofertaUID;
        const tipoDescuento = entrada.body.tipoDescuento ? entrada.body.tipoDescuento : null;
        let cantidad = entrada.body.cantidad;
        const numero = entrada.body.numero;
        const simboloNumero = entrada.body.simboloNumero;
        const contextoAplicacion = entrada.body.contextoAplicacion;
        const apartamentosSeleccionados = entrada.body.apartamentosSeleccionados;
        const filtroCantidad = /^\d+\.\d{2}$/;
        const filtroCadena = /['"\\;\r\n<>\t\b]/g;
        if (!ofertaUID || !Number.isInteger(ofertaUID) || ofertaUID <= 0) {
            const error = "El campo ofertaUID tiene que ser un numero, positivo y entero";
            throw new Error(error);
        }
        if (!nombreOferta) {
            const error = "El campo nombreOferta no admice comillas simples o dobles";
            throw new Error(error);
        }
        nombreOferta = nombreOferta.replace(filtroCadena, '');
        const fechaInicio_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaInicio)).fecha_ISO;
        const fechaFin_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaFin)).fecha_ISO;
        const fechaInicio_objeto = DateTime.fromISO(fechaInicio_ISO);
        const fechaFin_objeto = DateTime.fromISO(fechaFin_ISO);
        if (fechaInicio_objeto > fechaFin_objeto) {
            const error = "La fecha de inicio de la oferta no puede ser inferior a la fecha del fin de la oferta";
            throw new Error(error);
        }
        if (tipoOferta !== "porNumeroDeApartamentos" &&
            tipoOferta !== "porApartamentosEspecificos" &&
            tipoOferta !== "porDiasDeAntelacion" &&
            tipoOferta !== "porRangoDeFechas" &&
            tipoOferta !== "porDiasDeReserva") {
            const error = "No se reconoce el tipo de oferta";
            throw new Error(error);
        }
        const validadoresLocales = {
            numero: (numero) => {
                numero = Number(numero);
                if (!numero || !Number.isInteger(numero) || numero <= 0) {
                    const error = "El campo numero debe de ser un numer entero y positivo1";
                    throw new Error(error);
                }
            },
            simboloNumero: (simboloNumero) => {
                if (!simboloNumero || (simboloNumero !== "numeroExacto" && simboloNumero !== "aPartirDe")) {
                    const error = "El campo simboloNumero debe de ser un numer entero y positivo";
                    throw new Error(error);
                }
            },
            tipoDescuento: (tipoDescuento) => {
                if (!tipoDescuento || (tipoDescuento !== "cantidadFija" && tipoDescuento !== "porcentaje")) {
                    const error = `El tipo de descuento solo puede ser cantidadFija, porcentable o precioEstablecido`;
                    throw new Error(error);
                }
            },
            contextoAplicacion: (contextoAplicacion) => {
                if (!contextoAplicacion || (contextoAplicacion !== "totalNetoReserva" && contextoAplicacion !== "totalNetoApartamentoDedicado")) {
                    const error = `El campo contexto de aplicación solo puede ser, totalNetoReserva, totalNetoApartamentoDedicado`;
                    throw new Error(error);
                }
            },
            cantidad: (cantidad) => {
                if (!cantidad || !filtroCantidad.test(cantidad)) {
                    const error = "El campo cantidad debe ser un número con un máximo de dos decimales separados por punto. Recuerda que number es sin comillas.";
                    throw new Error(error);
                }
            },
            controlLimitePorcentaje: (tipoDescuento, cantidad) => {
                if (tipoDescuento === "porcentaje" && new Decimal(cantidad).greaterThan(100)) {
                    const error = "Cuidado! No se puede acepatar un porcentaje superior a 100% por que sino la oferta podria generar numeros negativos.";
                    throw new Error(error);
                }
            }
        };
        // Validar existencia de la oferta y estado
        const validarNombreOfertaUnico = `
                                    SELECT 
                                    "estadoOferta"
                                    FROM ofertas
                                    WHERE uid = $1;`;
        const consultaValidarNombreOfertaUnico = await conexion.query(validarNombreOfertaUnico, [ofertaUID]);
        if (consultaValidarNombreOfertaUnico.rowCount === 0) {
            const error = "No existe ninguna oferta con este identificador. Por lo tanto no se puede actualizar.";
            throw new Error(error);
        }
        const estadoOferta = consultaValidarNombreOfertaUnico.rows[0].estadoOferta;
        if (estadoOferta === "activada") {
            const error = "No se puede modificar una oferta activa. Primero desactiva con el boton de estado.";
            throw new Error(error);
        }
        const consultaActualizarCompartido = async (metadatos) => {
            const nombreOferta = metadatos.nombreOferta;
            const fechaInicio_ISO = metadatos.fechaInicio_ISO;
            const fechaFin_ISO = metadatos.fechaFin_ISO;
            const numero = metadatos.numero;
            const simboloNumero = metadatos.simboloNumero;
            const contextoAplicacion = metadatos.contextoAplicacion;
            const tipoOferta = metadatos.tipoOferta;
            const cantidad = metadatos.cantidad ? metadatos.cantidad : null;
            const tipoDescuento = metadatos.tipoDescuento;
            const ofertaUID = metadatos.ofertaUID;
            const actualizarOferta = `
                                       UPDATE ofertas
                                       SET
                                       "nombreOferta" = COALESCE($1, NULL),
                                       "fechaInicio" = COALESCE($2::date, NULL),
                                       "fechaFin" = COALESCE($3::date, NULL),
                                       "numero" = COALESCE($4::numeric, NULL),
                                       "simboloNumero" = COALESCE($5, NULL),
                                       "descuentoAplicadoA" = COALESCE($6, NULL),
                                       "tipoOferta" = COALESCE($7, NULL),
                                       cantidad = COALESCE($8::numeric, NULL),
                                       "tipoDescuento" = COALESCE($9, NULL)
                                       WHERE uid = $10;`;
            const datos = [
                nombreOferta,
                fechaInicio_ISO,
                fechaFin_ISO,
                numero,
                simboloNumero,
                contextoAplicacion,
                tipoOferta,
                cantidad,
                tipoDescuento,
                ofertaUID
            ];
            const resuelve = await conexion.query(actualizarOferta, datos);
            return resuelve.rows[0];
        };
        const eliminaPerfilApartamentoEspecificos = async (ofertaUID) => {
            const eliminarApartamentosDedicados = `
                                DELETE FROM "ofertasApartamentos"
                                WHERE oferta = $1;`;
            await conexion.query(eliminarApartamentosDedicados, [ofertaUID]);
        };
        await conexion.query('BEGIN'); // Inicio de la transacción


        // validadoresCompartidos.contextoAplicacion(contextoAplicacion)
        if (tipoOferta === "porNumeroDeApartamentos" ||
            tipoOferta === "porDiasDeAntelacion" ||
            tipoOferta === "porDiasDeReserva") {
            validadoresLocales.cantidad(cantidad);
            cantidad = Number(cantidad);
            validadoresLocales.tipoDescuento(tipoDescuento);
            validadoresLocales.numero(numero);
            validadoresLocales.simboloNumero(simboloNumero);
            validadoresLocales.controlLimitePorcentaje(tipoDescuento, cantidad);
            eliminaPerfilApartamentoEspecificos(ofertaUID);
            const metadatos = {
                nombreOferta: nombreOferta,
                fechaInicio_ISO: fechaInicio_ISO,
                fechaFin_ISO: fechaFin_ISO,
                numero: numero,
                simboloNumero: simboloNumero,
                // contextoAplicacion: contextoAplicacion,
                tipoOferta: tipoOferta,
                cantidad: cantidad,
                tipoDescuento: tipoDescuento,
                ofertaUID: ofertaUID,
            };
            await consultaActualizarCompartido(metadatos);
            await conexion.query('COMMIT');
            const ok = {
                ok: "Se ha acualizado correctamente la oferta",
                detallesOferta: await obtenerDetallesOferta(ofertaUID)
            };
            salida.json(ok);
        }
        if (tipoOferta === "porRangoDeFechas") {
            validadoresLocales.cantidad(cantidad);
            cantidad = Number(cantidad);
            validadoresLocales.tipoDescuento(tipoDescuento);
            validadoresLocales.controlLimitePorcentaje(tipoDescuento, cantidad);
            await eliminaPerfilApartamentoEspecificos(ofertaUID);
            const metadatos = {
                nombreOferta: nombreOferta,
                fechaInicio_ISO: fechaInicio_ISO,
                fechaFin_ISO: fechaFin_ISO,
                numero: numero,
                simboloNumero: simboloNumero,
                // contextoAplicacion: contextoAplicacion,
                tipoOferta: tipoOferta,
                cantidad: cantidad,
                tipoDescuento: tipoDescuento,
                ofertaUID: ofertaUID,
            };
            await consultaActualizarCompartido(metadatos);
            await conexion.query('COMMIT');
            const ok = {
                ok: "Se ha acualizado correctamente la oferta",
                detallesOferta: await obtenerDetallesOferta(ofertaUID)
            };
            salida.json(ok);
        }
        if (tipoOferta === "porApartamentosEspecificos") {
            validadoresLocales.contextoAplicacion(contextoAplicacion);
            const filtroCadena = /^[a-zA-Z0-9]+$/;
            const filtroCadenaUI = /^[a-zA-Z0-9\s]+$/;
            if (contextoAplicacion === "totalNetoReserva") {
                validadoresLocales.cantidad(cantidad);
                cantidad = Number(cantidad);
                validadoresLocales.tipoDescuento(tipoDescuento);
                validadoresLocales.controlLimitePorcentaje(tipoDescuento, cantidad);
            }
            if (contextoAplicacion === "totalNetoApartamentoDedicado") {
            }
            await eliminaPerfilApartamentoEspecificos(ofertaUID);
            const metadatos = {
                nombreOferta: nombreOferta,
                fechaInicio_ISO: fechaInicio_ISO,
                fechaFin_ISO: fechaFin_ISO,
                contextoAplicacion: contextoAplicacion,
                tipoOferta: tipoOferta,
                cantidad: cantidad,
                tipoDescuento: tipoDescuento,
                ofertaUID: ofertaUID,
            };
            await consultaActualizarCompartido(metadatos);
            if (typeof apartamentosSeleccionados !== 'object' && !Array.isArray(apartamentosSeleccionados)) {
                const error = "El campo apartamentosSeleccionados solo admite un arreglo";
                throw new Error(error);
            }
            if (apartamentosSeleccionados.length === 0) {
                const error = "Anada al menos un apartmento dedicado";
                throw new Error(error);
            }
            for (const apartamentoSeleccionado of apartamentosSeleccionados) {
                const apartamentoIDV = apartamentoSeleccionado.apartamentoIDV;
                const apartamentoUI = apartamentoSeleccionado.apartamentoUI;
                const tipoDescuentoApartamento = apartamentoSeleccionado.tipoDescuento;
                const cantidadPorApartamento = apartamentoSeleccionado.cantidad;
                if (!apartamentoIDV || !filtroCadena.test(apartamentoIDV)) {
                    const error = "El campo apartamentoIDV solo admite minúsculas, mayúsculas y numeros nada mas ni espacios";
                    throw new Error(error);
                }
                if (!apartamentoUI || !filtroCadenaUI.test(apartamentoUI)) {
                    const error = "El campo apartamentoUI solo admite minúsculas, mayúsculas, numeros y espacios nada mas ni espacios";
                    throw new Error(error);
                }
                if (contextoAplicacion === "totalNetoApartamentoDedicado") {
                    if (!tipoDescuentoApartamento || (tipoDescuentoApartamento !== "cantidadFija" && tipoDescuentoApartamento !== "porcentaje") && tipoDescuentoApartamento !== "precioEstablecido") {
                        const error = `El apartamento ${apartamentoUI} debe de tener un tipo de descuente seleccionado, revisa los apartamentos para ver si en alguno falta un tipo de descuente`;
                        throw new Error(error);
                    }
                    if (!cantidadPorApartamento || typeof cantidadPorApartamento !== "string" || !filtroCantidad.test(cantidadPorApartamento)) {
                        const error = `El campo cantidad del ${apartamentoUI} dedicado debe ser un número con un máximo de dos decimales separados por punto. Escribe los decimales igualmente, ejemplo 10.00`;
                        throw new Error(error);
                    }
                    validadoresLocales.controlLimitePorcentaje(tipoDescuentoApartamento, cantidadPorApartamento);
                }
            }
            for (const apartamentoDedicado of apartamentosSeleccionados) {
                const apartamentoIDV = apartamentoDedicado.apartamentoIDV;
                let tipoDescuento = null;
                let cantidadPorApartamento = null;
                if (contextoAplicacion === "totalNetoApartamentoDedicado") {
                    tipoDescuento = apartamentoDedicado.tipoDescuento;
                    cantidadPorApartamento = apartamentoDedicado.cantidad;
                }
                const ofertaApartamentosDedicados = `
                                            INSERT INTO "ofertasApartamentos"
                                            (
                                            oferta,
                                            apartamento,
                                            "tipoDescuento",
                                            cantidad
                                            )
                                            VALUES
                                            (
                                            NULLIF($1::numeric, NULL),
                                            COALESCE($2, NULL),
                                            COALESCE($3, NULL),
                                            NULLIF($4::numeric, NULL)
                                            )
                                            RETURNING uid;`;
                const detallesApartamentoDedicado = [
                    Number(ofertaUID),
                    apartamentoIDV,
                    tipoDescuento,
                    Number(cantidadPorApartamento)
                ];
                await conexion.query(ofertaApartamentosDedicados, detallesApartamentoDedicado);
            }
            await conexion.query('COMMIT');
            const ok = {
                ok: "La oferta  se ha actualizado bien junto con los apartamentos dedicados",
                detallesOferta: await obtenerDetallesOferta(ofertaUID)
            };
            salida.json(ok);
        }
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK');
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    } finally {
        mutex.release();
    }

}