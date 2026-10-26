import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import GestionInscripciones from './GestionInscripciones'

const curso = {
    id: 1,
    nombre_materia: 'Matemática',
    division: 'A',
}

function crearProps(overrides = {}) {
    return {
        curso,
        alumnos: [],
        cargandoAlumnos: false,
        errorAlumnos: '',
        inscripciones: [],
        procesando: false,
        onInscribir: vi.fn(),
        onRegistrar: vi.fn(),
        onQuitar: vi.fn(),
        onImportar: vi.fn(),
        importando: false,
        onLimpiarMensajes: vi.fn(),
        ...overrides,
    }
}

async function abrirImportacion(user) {
    await user.click(
        screen.getByRole('tab', { name: 'Importar planilla' })
    )
}

describe('GestionInscripciones', () => {
    it('importa una planilla y muestra el resumen con errores', async () => {
        const user = userEvent.setup()
        const resultado = {
            total_filas: 3,
            alumnos_creados: 1,
            alumnos_inscriptos: 1,
            alumnos_omitidos: 1,
            errores: [
                {
                    fila: 3,
                    documento: 'IMP-002',
                    mensaje: 'El apellido debe tener al menos 2 caracteres',
                },
            ],
            alumnos: [],
            inscripciones: [],
        }
        const props = crearProps({
            onImportar: vi.fn().mockResolvedValue(resultado),
        })

        render(<GestionInscripciones {...props} />)
        await abrirImportacion(user)

        const archivo = new File(
            ['nombre,apellido\nAna,Gomez'],
            'alumnos.csv',
            { type: 'text/csv' }
        )

        await user.upload(screen.getByLabelText('Planilla'), archivo)
        await user.click(screen.getByRole('button', { name: 'Importar' }))

        expect(props.onImportar).toHaveBeenCalledWith(archivo)

        const estado = await screen.findByRole('status')
        expect(estado).toHaveTextContent('3 filas procesadas')
        expect(estado).toHaveTextContent(
            '1 alumno creado, 1 inscripto y 1 omitido.'
        )

        const tabla = within(estado).getByRole('table')
        expect(within(tabla).getByText('IMP-002')).toBeInTheDocument()
        expect(within(tabla).getByText(
            'El apellido debe tener al menos 2 caracteres'
        )).toBeInTheDocument()

        await user.click(
            within(estado).getByRole('button', { name: 'Cerrar' })
        )
        expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it('usa singular cuando la importación procesa una fila', async () => {
        const user = userEvent.setup()
        const props = crearProps({
            onImportar: vi.fn().mockResolvedValue({
                total_filas: 1,
                alumnos_creados: 1,
                alumnos_inscriptos: 1,
                alumnos_omitidos: 0,
                errores: [],
                alumnos: [],
                inscripciones: [],
            }),
        })

        render(<GestionInscripciones {...props} />)
        await abrirImportacion(user)

        await user.upload(
            screen.getByLabelText('Planilla'),
            new File(['x'], 'alumnos.xlsx')
        )
        await user.click(screen.getByRole('button', { name: 'Importar' }))

        const estado = await screen.findByRole('status')
        expect(estado).toHaveTextContent('1 fila procesada')
        expect(estado).toHaveTextContent(
            '1 alumno creado, 1 inscripto y 0 omitidos.'
        )
        expect(within(estado).queryByRole('table')).not.toBeInTheDocument()
    })

    it('rechaza archivos con extensión no permitida', async () => {
        const user = userEvent.setup({ applyAccept: false })
        const props = crearProps()

        render(<GestionInscripciones {...props} />)
        await abrirImportacion(user)

        await user.upload(
            screen.getByLabelText('Planilla'),
            new File(['x'], 'alumnos.txt', { type: 'text/plain' })
        )
        await user.click(screen.getByRole('button', { name: 'Importar' }))

        expect(screen.getByRole('alert')).toHaveTextContent(
            'El archivo debe ser CSV o XLSX'
        )
        expect(props.onImportar).not.toHaveBeenCalled()
    })

    it('rechaza archivos de más de 5 MB antes de llamar al backend', async () => {
        const user = userEvent.setup()
        const props = crearProps()

        render(<GestionInscripciones {...props} />)
        await abrirImportacion(user)

        const archivo = new File(['x'], 'alumnos.csv')
        Object.defineProperty(archivo, 'size', {
            value: 5 * 1024 * 1024 + 1,
        })

        await user.upload(screen.getByLabelText('Planilla'), archivo)
        await user.click(screen.getByRole('button', { name: 'Importar' }))

        expect(screen.getByRole('alert')).toHaveTextContent(
            'El archivo supera el tamaño máximo de 5 MB'
        )
        expect(props.onImportar).not.toHaveBeenCalled()
    })

    it('deshabilita la importación mientras se está procesando', async () => {
        const user = userEvent.setup()

        render(
            <GestionInscripciones
                {...crearProps({ importando: true })}
            />
        )
        await abrirImportacion(user)

        expect(screen.getByLabelText('Planilla')).toBeDisabled()
        expect(screen.getByRole('button', { name: 'Importando...' }))
            .toBeDisabled()
    })
})
