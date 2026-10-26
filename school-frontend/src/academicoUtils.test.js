import { describe, expect, it } from 'vitest'

import {
    calcularPromedio,
    formatearFecha,
    formatearNota,
    formatearPromedio,
    nombreAlumno,
    nombreCurso,
    ordenarAlumnos,
} from './academicoUtils'

describe('academicoUtils', () => {
    it('formatea fechas ISO y conserva valores inválidos', () => {
        expect(formatearFecha('2009-04-12')).toBe('12/04/2009')
        expect(formatearFecha('')).toBe('-')
        expect(formatearFecha('sin-fecha')).toBe('sin-fecha')
    })

    it('formatea notas y promedios con la configuración local', () => {
        expect(formatearNota(8.5)).toBe('8,5')
        expect(formatearPromedio(8.333)).toBe('8,33')
    })

    it('arma los nombres de alumnos y cursos', () => {
        expect(nombreAlumno({ apellido: 'Gomez', nombre: 'Ana' }))
            .toBe('Gomez, Ana')
        expect(nombreCurso({
            nombre_materia: 'Matemática',
            division: 'A',
            anio_lectivo: 2026,
        })).toBe('Matemática · A · 2026')
    })

    it('ordena alumnos por apellido y nombre sin mutar el original', () => {
        const alumnos = [
            { nombre: 'Bruno', apellido: 'Perez' },
            { nombre: 'Ana', apellido: 'Gomez' },
            { nombre: 'Zoe', apellido: 'Gomez' },
        ]

        const ordenados = ordenarAlumnos(alumnos)

        expect(ordenados.map((alumno) => alumno.nombre))
            .toEqual(['Ana', 'Zoe', 'Bruno'])
        expect(alumnos.map((alumno) => alumno.nombre))
            .toEqual(['Bruno', 'Ana', 'Zoe'])
    })

    it('calcula el promedio y devuelve null sin calificaciones', () => {
        expect(calcularPromedio([])).toBeNull()
        expect(calcularPromedio([
            { nota: 7 },
            { nota: 9 },
        ])).toBe(8)
    })
})
