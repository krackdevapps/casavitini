
import { describe, expect, test } from '@jest/globals';
import { obtenerTodasLasHabitaciones } from '../../../../../logica/repositorio/arquitectura/entidades/habitacion/obtenerTodasLasHabitaciones.mjs';
import { eliminarCamaComoEntidad } from '../../../../../logica/repositorio/arquitectura/entidades/cama/eliminarCamaComoEntidad.mjs';
import { insertarCamaComoEntidad } from '../../../../../logica/repositorio/arquitectura/entidades/cama/insertarCamaComoEntidad.mjs';
import { obtenerCamaComoEntidadPorCamaIDV } from '../../../../../logica/repositorio/arquitectura/entidades/cama/obtenerCamaComoEntidadPorCamaIDV.mjs';
import { actualizarCamaComoEntidadPorCamaIDV } from '../../../../../logica/repositorio/arquitectura/entidades/cama/actualizarCamaComoEntidadPorCamaIDV.mjs';
import { obtenerCamaComoEntidadPorCamaUI } from '../../../../../logica/repositorio/arquitectura/entidades/cama/obtenerCamaComoEntidadPorCamaUI.mjs';
describe('crud bed as entity', () => {
    const IDVStart = "camaTestInicial"
    const IDVFinal = "camaTestFinal"
    const UIStart = "nombreCamaTest"
    beforeAll(async () => {
        await eliminarCamaComoEntidad(IDVStart)
        await eliminarCamaComoEntidad(IDVFinal)
    })
    test('insert bed', async () => {
        const makeEntity = {
            camaIDV: IDVStart,
            camaUI: UIStart,
            capacidad: 2,
        }
        const respons = await insertarCamaComoEntidad(makeEntity)
        expect(respons).not.toBeUndefined();
        expect(typeof respons).toBe('object');
    })
    test('select bed by camaIDV', async () => {
        const respons = await obtenerCamaComoEntidadPorCamaIDV(IDVStart)
        expect(respons).not.toBeUndefined();
        expect(typeof respons).toBe('object');
    })
    test('select bed by camaUI', async () => {
        const respons = await obtenerCamaComoEntidadPorCamaUI(UIStart)
        expect(respons).not.toBeUndefined();
        expect(typeof respons).toBe('object');
    })
    test('select all beds', async () => {
        const respons = await obtenerTodasLasHabitaciones()
        expect(respons).not.toBeUndefined();
        expect(Array.isArray(respons)).toBe(true);
    })
    test('update bed', async () => {
        const updateEntity = {
            camaIDVNuevo: IDVFinal,
            camaUI: UIStart,
            capacidad: 4,
            camaIDVSelector: IDVStart,
        }
        const respons = await actualizarCamaComoEntidadPorCamaIDV(updateEntity);
        expect(respons).not.toBeUndefined();
        expect(typeof respons).toBe('object');
    })
    afterAll(async () => {
        await eliminarCamaComoEntidad(IDVStart)
        await eliminarCamaComoEntidad(IDVFinal)
    });
})