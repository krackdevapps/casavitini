import { conexion } from "../../../../componentes/db.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";

export const crearEntidadAlojamiento = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return


        const tipoEntidad = validadoresCompartidos.tipos.cadena({
            string: entrada.body.tipoEntidad,
            nombreCampo: "El tipoEntidad",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "no",
            soloMinusculas: "si"
        })


        if (tipoEntidad === "apartamento") {
            const apartamentoUI = validadoresCompartidos.tipos.cadena({
                string: entrada.body.apartamentoUI,
                nombreCampo: "El campo del apartamentoUI",
                filtro: "strictoConEspacios",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
            })

            const apartamentoIDV = validadoresCompartidos.tipos.cadena({
                string: entrada.body.apartamentoIDV || apartamentoUI.toLowerCase().replace(/[^a-z0-9]/g, ''),
                nombreCampo: "El apartamentoIDV",
                filtro: "strictoIDV",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
                soloMinusculas: "si"
            })


            const validarCodigo = async (apartamentoIDV) => {
                const validarCodigoAleatorio = `
                                        SELECT
                                        apartamento
                                        FROM apartamentos
                                        WHERE apartamento = $1;`;
                const resuelveValidarCodigoAleatorio = await conexion.query(validarCodigoAleatorio, [apartamentoIDV]);
                if (resuelveValidarCodigoAleatorio.rowCount === 1) {
                    return true;
                }
            };
            const controlApartamentoIDV = async (apartamentoIDV) => {
                let codigoGenerado = apartamentoIDV;
                let codigoExiste;
                do {
                    codigoExiste = await validarCodigo(codigoGenerado);
                    if (codigoExiste) {
                        // Si el código ya existe, agrega un cero al final y vuelve a verificar
                        codigoGenerado = codigoGenerado + "0";
                    }
                } while (codigoExiste);
                return codigoGenerado;
            };
            const apartamentoIDV_unico = await controlApartamentoIDV(apartamentoIDV);
            const validarIDV = `
                                    SELECT 
                                    *
                                    FROM apartamentos
                                    WHERE apartamento = $1
                                    `;
            const resuelveValidarIDV = await conexion.query(validarIDV, [apartamentoIDV_unico]);
            if (resuelveValidarIDV.rowCount === 1) {
                const error = "Ya existe un identificador visual igual que el apartamento que propones, escoge otro";
                throw new Error(error);
            }
            const validarUI = `
                                    SELECT 
                                    *
                                    FROM apartamentos
                                    WHERE "apartamentoUI" = $1
                                    `;
            const resuelveValidarUI = await conexion.query(validarUI, [apartamentoUI]);
            if (resuelveValidarUI.rowCount === 1) {
                const error = "Ya existe un apartamento con ese nombre, por tema de legibilidad escoge otro";
                throw new Error(error);
            }
            const crearEntidad = `
                                    INSERT INTO apartamentos
                                    (
                                    apartamento,
                                    "apartamentoUI"
                                    )
                                    VALUES 
                                    (
                                    $1,
                                    $2
                                    )
                                    RETURNING apartamento
                                    `;
            const matriozDatosNuevaEntidad = [
                apartamentoIDV_unico,
                apartamentoUI
            ];
            const resuelveCrearEntidad = await conexion.query(crearEntidad, matriozDatosNuevaEntidad);
            if (resuelveCrearEntidad.rowCount === 0) {
                const error = "No se ha podido crear la nueva entidad";
                throw new Error(error);
            }
            if (resuelveCrearEntidad.rowCount === 1) {
                const ok = {
                    ok: "Se ha creado correctament la nuevo entidad como apartamento",
                    nuevoUID: resuelveCrearEntidad.rows[0].apartamento
                };
                salida.json(ok);
            }
        }
        if (tipoEntidad === "habitacion") {

            const habitacionUI = validadoresCompartidos.tipos.cadena({
                string: entrada.body.habitacionUI,
                nombreCampo: "El campo del habitacionUI",
                filtro: "strictoConEspacios",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
            })

            const habitacionIDV = validadoresCompartidos.tipos.cadena({
                string: entrada.body.habitacionIDV || habitacionUI.toLowerCase().replace(/[^a-z0-9]/g, ''),
                nombreCampo: "El habitacionIDV",
                filtro: "strictoIDV",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
                soloMinusculas: "si"
            })
            const validarCodigo = async (habitacionIDV) => {
                const validarCodigoAleatorio = `
                                        SELECT
                                        *
                                        FROM habitaciones
                                        WHERE habitacion = $1;`;
                const resuelveValidarCodigoAleatorio = await conexion.query(validarCodigoAleatorio, [habitacionIDV]);
                if (resuelveValidarCodigoAleatorio.rowCount === 1) {
                    return true;
                }
            };
            const controlHabitacionIDV = async (habitacionIDV) => {
                let codigoGenerado = habitacionIDV;
                let codigoExiste;
                do {
                    codigoExiste = await validarCodigo(codigoGenerado);
                    if (codigoExiste) {
                        // Si el código ya existe, agrega un cero al final y vuelve a verificar
                        codigoGenerado = codigoGenerado + "_0";
                    }
                } while (codigoExiste);
                return codigoGenerado;
            };
            const habitacionIDV_unico = await controlHabitacionIDV(habitacionIDV);
            const validarIDV = `
                                    SELECT 
                                    *
                                    FROM habitaciones
                                    WHERE habitacion = $1
                                    `;
            const resuelveValidarIDV = await conexion.query(validarIDV, [habitacionIDV_unico]);
            if (resuelveValidarIDV.rowCount === 1) {
                const error = "Ya existe un identificador visual igual que el que propones, escoge otro";
                throw new Error(error);
            }
            const validarUI = `
                                    SELECT 
                                    *
                                    FROM habitaciones
                                    WHERE "habitacionUI" = $1
                                    `;
            const resuelveValidarUI = await conexion.query(validarUI, [habitacionUI]);
            if (resuelveValidarUI.rowCount === 1) {
                const error = "Ya existe un nombre de la habitacion exactamente igual, por tema de legibilidad escoge otro";
                throw new Error(error);
            }
            const crearEntidad = `
                                    INSERT INTO habitaciones
                                    (
                                    habitacion,
                                    "habitacionUI"
                                    )
                                    VALUES 
                                    (
                                    $1,
                                    $2
                                    )
                                    RETURNING habitacion
                                    `;
            const matriozDatosNuevaEntidad = [
                habitacionIDV_unico,
                habitacionUI,
            ];
            const resuelveCrearEntidad = await conexion.query(crearEntidad, matriozDatosNuevaEntidad);
            if (resuelveCrearEntidad.rowCount === 0) {
                const error = "No se ha podido crear la nueva entidad";
                throw new Error(error);
            }
            if (resuelveCrearEntidad.rowCount === 1) {
                const ok = {
                    ok: "Se ha creado correctament la nuevo entidad como habitacion",
                    nuevoUID: resuelveCrearEntidad.rows[0].habitacion
                };
                salida.json(ok);
            }
        }
        if (tipoEntidad === "cama") {


            const camaUI = validadoresCompartidos.tipos.cadena({
                string: entrada.body.camaUI,
                nombreCampo: "El campo del camaUI",
                filtro: "strictoConEspacios",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
            })

            const camaIDV = validadoresCompartidos.tipos.cadena({
                string: entrada.body.camaIDV || camaUI.toLowerCase().replace(/[^a-z0-9]/g, ''),
                nombreCampo: "El camaIDV",
                filtro: "strictoIDV",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
                soloMinusculas: "si"
            })

            const capacidad = validadoresCompartidos.tipos.cadena({
                string: entrada.body.capacidad,
                nombreCampo: "El campo capacidad",
                filtro: "cadenaConNumerosEnteros",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
            })


            const validarCodigo = async (camaIDV) => {
                const validarCodigoAleatorio = `
                                        SELECT
                                        *
                                        FROM camas
                                        WHERE cama = $1;`;
                const resuelveValidarCodigoAleatorio = await conexion.query(validarCodigoAleatorio, [camaIDV]);
                if (resuelveValidarCodigoAleatorio.rowCount === 1) {
                    return true;
                }
            };
            const controlCamaIDV = async (camaIDV) => {
                let codigoGenerado = camaIDV;
                let codigoExiste;
                do {
                    codigoExiste = await validarCodigo(codigoGenerado);
                    if (codigoExiste) {
                        // Si el código ya existe, agrega un cero al final y vuelve a verificar
                        codigoGenerado = codigoGenerado + "0";
                    }
                } while (codigoExiste);
                return codigoGenerado;
            };
            const camaIDV_unico = await controlCamaIDV(camaIDV);

            if (!capacidad || !Number.isInteger(capacidad) || capacidad < 0) {
                const error = "el campo 'capacidad' solo puede ser numeros, entero y positivo";
                throw new Error(error);
            }
            const validarIDV = `
                                    SELECT 
                                    *
                                    FROM camas
                                    WHERE cama = $1
                                    `;
            const resuelveValidarIDV = await conexion.query(validarIDV, [camaIDV_unico]);
            if (resuelveValidarIDV.rowCount === 1) {
                const error = "Ya existe un identificador visual igual que la cama que propones, escoge otro";
                throw new Error(error);
            }
            const validarUI = `
                                    SELECT 
                                    *
                                    FROM camas
                                    WHERE "camaUI" = $1
                                    `;
            const resuelveValidarUI = await conexion.query(validarUI, [camaUI]);
            if (resuelveValidarUI.rowCount === 1) {
                const error = "Ya existe una cama con ese nombre, por tema de legibilidad escoge otro";
                throw new Error(error);
            }
            const crearEntidad = `
                                    INSERT INTO camas
                                    (
                                    cama,
                                    "camaUI",
                                    capacidad
                                    )
                                    VALUES 
                                    (
                                    $1,
                                    $2,
                                    $3
                                    )
                                    RETURNING cama
                                    `;
            const matriozDatosNuevaEntidad = [
                camaIDV_unico,
                camaUI,
                capacidad
            ];
            const resuelveCrearEntidad = await conexion.query(crearEntidad, matriozDatosNuevaEntidad);
            if (resuelveCrearEntidad.rowCount === 0) {
                const error = "No se ha podido crear la nueva entidad";
                throw new Error(error);
            }
            if (resuelveCrearEntidad.rowCount === 1) {
                const ok = {
                    ok: "Se ha creado correctament la nuevo entidad como cama",
                    nuevoUID: resuelveCrearEntidad.rows[0].cama
                };
                salida.json(ok);
            }
        }
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }
}