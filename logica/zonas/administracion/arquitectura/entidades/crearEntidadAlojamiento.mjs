import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";

import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoUI } from "../../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoUI.mjs";
import { insertarApartamentoComoEntidad } from "../../../../repositorio/arquitectura/entidades/apartamento/insertarApartamentoComoEntidad.mjs";
import { obtenerHabitacionComoEntidadPorHabitacionIDV } from "../../../../repositorio/arquitectura/entidades/habitacion/obtenerHabitacionComoEntidadPorHabitacionIDV.mjs";
import { obtenerHabitacionComoEntidadPorHabitacionUI } from "../../../../repositorio/arquitectura/entidades/habitacion/obtenerHabitacionComoEntidadPorHabitacionUI.mjs";
import { insertarHabitacionComoEntidad } from "../../../../repositorio/arquitectura/entidades/habitacion/insertarHabitacionComoEntidad.mjs";
import { obtenerCamaComoEntidadPorCamaIDV } from "../../../../repositorio/arquitectura/entidades/cama/obtenerCamaComoEntidadPorCamaIDV.mjs";
import { obtenerCamaComoEntidadPorCamaUI } from "../../../../repositorio/arquitectura/entidades/cama/obtenerCamaComoEntidadPorCamaUI.mjs";
import { insertarCamaComoEntidad } from "../../../../repositorio/arquitectura/entidades/cama/insertarCamaComoEntidad.mjs";

export const crearEntidadAlojamiento = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const tipoEntidad = validadoresCompartidos.tipos.cadena({
            string: entrada.body.tipoEntidad,
            nombreCampo: "El tipoEntidad",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "no",
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
            })

            const validarCodigo = async (apartamentoIDV) => {
                const detallesApartamentoComoEntidad = await obtenerApartamentoComoEntidadPorApartamentoIDV(apartamentoIDV)
                if (detallesApartamentoComoEntidad.apartamento) {
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
            const detallesApartamentoComoEntidad = await obtenerApartamentoComoEntidadPorApartamentoIDV(apartamentoIDV_unico)

            if (detallesApartamentoComoEntidad.rowCount === 1) {
                const error = "Ya existe un identificador visual igual que el apartamento que propones, escoge otro";
                throw new Error(error);
            }
            const apartamentoEntidad = await obtenerApartamentoComoEntidadPorApartamentoUI(apartamentoUI)

            if (apartamentoEntidad.apartamentoUI) {
                const error = "Ya existe un apartamento con ese nombre, por tema de legibilidad escoge otro";
                throw new Error(error);
            }
            const dataInsertarApartamentoComoEntidad = {
                apartamentoIDV: apartamentoIDV_unico,
                apartamentoUI: apartamentoUI
            }
            const nuevoApartamentoComEntidad = await insertarApartamentoComoEntidad(dataInsertarApartamentoComoEntidad)
            const ok = {
                ok: "Se ha creado correctament la nuevo entidad como apartamento",
                nuevoUID: nuevoApartamentoComEntidad.apartamento
            };
            return ok

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

                const habitacion = await obtenerHabitacionComoEntidadPorHabitacionIDV(habitacionIDV)
                if (habitacion.habitacionUI) {
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

            const habitacionComoEntidad = await obtenerHabitacionComoEntidadPorHabitacionIDV(habitacionIDV_unico)

            if (habitacionComoEntidad.habitacion) {
                const error = "Ya existe un identificador visual igual que el que propones, escoge otro";
                throw new Error(error);
            }
            const nombreHabitacionUI = await obtenerHabitacionComoEntidadPorHabitacionUI(habitacionUI).habitacionUI
            if (nombreHabitacionUI.habitacion) {
                const error = "Ya existe un nombre de la habitacion exactamente igual, por tema de legibilidad escoge otro";
                throw new Error(error);
            }

            const dataInsertarHabitacionComoEntidad = {
                habitacionIDV: habitacionIDV_unico,
                habitacionUI: habitacionUI
            }
            const nuevaHabitacionComoEntidad = await insertarHabitacionComoEntidad(dataInsertarHabitacionComoEntidad)

            const ok = {
                ok: "Se ha creado correctament la nuevo entidad como habitacion",
                nuevoUID: nuevaHabitacionComoEntidad.habitacion
            };
            return ok

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

            const capacidad = validadoresCompartidos.tipos.numero({
                string: entrada.body.capacidad,
                nombreCampo: "El campo capacidad",
                filtro: "numeroSimple",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
                sePermitenNegativos: "no"
            })

            const validarCodigo = async (camaIDV) => {
                const camaEntidad = await obtenerCamaComoEntidadPorCamaIDV(camaIDV)
                if (camaEntidad.cama) {
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

            const camaEntidad = await obtenerCamaComoEntidadPorCamaIDV(camaIDV_unico)

            if (camaEntidad.cama) {
                const error = "Ya existe un identificador visual igual que la cama que propones, escoge otro";
                throw new Error(error);
            }
            const camaUIExistene = await obtenerCamaComoEntidadPorCamaUI(camaUI)

            if (camaUIExistene.cama) {
                const error = "Ya existe una cama con ese nombre, por tema de legibilidad escoge otro";
                throw new Error(error);
            }
            const dataInsertarCamaComoEntidad = {

                camaIDV: camaIDV_unico,
                camaUI: camaUI,
                capacidad: capacidad
            }

            const nuevaCama = await insertarCamaComoEntidad(dataInsertarCamaComoEntidad)

            const ok = {
                ok: "Se ha creado correctament la nuevo entidad como cama",
                nuevoUID: nuevaCama.cama
            };
            return ok

        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}