import { afterEach, describe, expect, it, vi } from 'vitest'

import { importarAlumnos } from './academicoService'

const archivo = new File(['contenido'], 'alumnos.csv', {
    type: 'text/csv',
})

afterEach(() => {
    vi.unstubAllGlobals()
})

describe('importarAlumnos', () => {
    it('envía el curso y el archivo como multipart sin Content-Type manual', async () => {
        const datos = {
            total_filas: 1,
            alumnos_creados: 1,
            alumnos_inscriptos: 1,
            alumnos_omitidos: 0,
            errores: [],
            alumnos: [],
            inscripciones: [],
        }
        const fetchMock = vi.fn().mockResolvedValue({
            status: 200,
            ok: true,
            json: vi.fn().mockResolvedValue(datos),
        })
        vi.stubGlobal('fetch', fetchMock)

        const respuesta = await importarAlumnos('token-qa', 7, archivo)

        expect(respuesta).toEqual(datos)
        expect(fetchMock).toHaveBeenCalledTimes(1)

        const [url, opciones] = fetchMock.mock.calls[0]

        expect(url).toContain('/alumnos/importar')
        expect(opciones.method).toBe('POST')
        expect(opciones.headers).toEqual({
            Authorization: 'Bearer token-qa',
        })
        expect(opciones.body).toBeInstanceOf(FormData)
        expect(opciones.body.get('curso_id')).toBe('7')
        expect(opciones.body.get('archivo')).toBe(archivo)
    })

    it('propaga el detalle de error del backend', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            status: 409,
            ok: false,
            json: vi.fn().mockResolvedValue({
                detail: 'El curso está inactivo',
            }),
        })
        vi.stubGlobal('fetch', fetchMock)

        await expect(
            importarAlumnos('token-qa', 7, archivo)
        ).rejects.toMatchObject({
            status: 409,
            message: 'El curso está inactivo',
        })
    })
})
