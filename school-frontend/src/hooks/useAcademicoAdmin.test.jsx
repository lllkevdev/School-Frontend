import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import useAcademicoAdmin from './useAcademicoAdmin'

const mocks = vi.hoisted(() => ({
    obtenerEvaluacionesCurso: vi.fn(),
    obtenerCalificacionesCurso: vi.fn(),
    obtenerInscripcionesCurso: vi.fn(),
    importarAlumnos: vi.fn(),
}))

vi.mock('../academicoService', async (importOriginal) => {
    const actual = await importOriginal()

    return {
        ...actual,
        obtenerEvaluacionesCurso: mocks.obtenerEvaluacionesCurso,
        obtenerCalificacionesCurso: mocks.obtenerCalificacionesCurso,
        obtenerInscripcionesCurso: mocks.obtenerInscripcionesCurso,
        importarAlumnos: mocks.importarAlumnos,
    }
})

const cursos = [
    {
        id: 1,
        nombre_materia: 'Matemática',
        division: 'A',
        anio_lectivo: 2026,
        cantidad_periodos: 3,
        activo: true,
    },
]

const alumno = {
    id: 5,
    nombre: 'Ana',
    apellido: 'Gomez',
    documento_identidad: 'IMP-001',
    fecha_nacimiento: '2009-04-12',
    activo: true,
}

const archivo = new File(['contenido'], 'alumnos.csv')

function montarHook(onAlumnoRegistrado = vi.fn(), cerrarSesion = vi.fn()) {
    return renderHook(() => useAcademicoAdmin(
        'token',
        cerrarSesion,
        cursos,
        onAlumnoRegistrado
    ))
}

beforeEach(() => {
    vi.clearAllMocks()
    mocks.obtenerEvaluacionesCurso.mockResolvedValue([])
    mocks.obtenerCalificacionesCurso.mockResolvedValue([])
    mocks.obtenerInscripcionesCurso.mockResolvedValue([
        { id: 10, alumno_id: 1, curso_id: 1 },
    ])
})

describe('useAcademicoAdmin', () => {
    it('agrega solo las inscripciones nuevas y registra los alumnos', async () => {
        const onAlumnoRegistrado = vi.fn()
        mocks.importarAlumnos.mockResolvedValue({
            total_filas: 1,
            alumnos_creados: 1,
            alumnos_inscriptos: 1,
            alumnos_omitidos: 0,
            errores: [],
            alumnos: [alumno],
            inscripciones: [
                { id: 10, alumno_id: 1, curso_id: 1 },
                { id: 11, alumno_id: 5, curso_id: 1 },
            ],
        })

        const { result } = montarHook(onAlumnoRegistrado)

        await waitFor(() => expect(result.current.cargando).toBe(false))

        let respuesta

        await act(async () => {
            respuesta = await result.current.importarAlumnos(archivo)
        })

        expect(mocks.importarAlumnos).toHaveBeenCalledWith(
            'token',
            1,
            archivo
        )
        expect(respuesta.alumnos_creados).toBe(1)
        expect(result.current.inscripciones.map(
            (inscripcion) => inscripcion.id
        )).toEqual([10, 11])
        expect(onAlumnoRegistrado).toHaveBeenCalledWith(alumno)
        expect(result.current.importando).toBe(false)
    })

    it('expone importando mientras la petición está pendiente', async () => {
        let resolver
        mocks.importarAlumnos.mockReturnValue(new Promise((resolve) => {
            resolver = resolve
        }))

        const { result } = montarHook()

        await waitFor(() => expect(result.current.cargando).toBe(false))

        let accion

        act(() => {
            accion = result.current.importarAlumnos(archivo)
        })

        expect(result.current.importando).toBe(true)

        await act(async () => {
            resolver({
                total_filas: 1,
                alumnos_creados: 1,
                alumnos_inscriptos: 1,
                alumnos_omitidos: 0,
                errores: [],
                alumnos: [alumno],
                inscripciones: [
                    { id: 11, alumno_id: 5, curso_id: 1 },
                ],
            })
            await accion
        })

        expect(result.current.importando).toBe(false)
    })

    it('muestra el error de importación y no actualiza inscripciones', async () => {
        const error = Object.assign(
            new Error('El curso está inactivo'),
            { status: 409 }
        )
        mocks.importarAlumnos.mockRejectedValue(error)

        const { result } = montarHook()

        await waitFor(() => expect(result.current.cargando).toBe(false))

        let respuesta

        await act(async () => {
            respuesta = await result.current.importarAlumnos(archivo)
        })

        expect(respuesta).toBeNull()
        expect(result.current.errorOperacion)
            .toBe('El curso está inactivo')
        expect(result.current.inscripciones.map(
            (inscripcion) => inscripcion.id
        )).toEqual([10])
    })

    it('cierra la sesión si la importación devuelve 401', async () => {
        const cerrarSesion = vi.fn()
        mocks.importarAlumnos.mockRejectedValue(
            Object.assign(new Error('No autorizado'), { status: 401 })
        )

        const { result } = montarHook(vi.fn(), cerrarSesion)

        await waitFor(() => expect(result.current.cargando).toBe(false))

        await act(async () => {
            await result.current.importarAlumnos(archivo)
        })

        expect(cerrarSesion).toHaveBeenCalledWith(true)
        expect(result.current.errorOperacion).toBe('')
    })
})
