import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import Cursos from './Cursos'

const cursos = [
    {
        id: 1,
        nombre_materia: 'Matemática',
        division: 'A',
        anio_lectivo: 2026,
        cantidad_periodos: 3,
        activo: true,
    },
    {
        id: 2,
        nombre_materia: 'Historia',
        division: 'B',
        anio_lectivo: 2025,
        cantidad_periodos: 2,
        activo: false,
    },
]

function crearProps(overrides = {}) {
    return {
        cursos,
        cargando: false,
        errorCarga: '',
        onCrear: vi.fn(),
        creando: false,
        errorCrear: '',
        onActualizar: vi.fn().mockResolvedValue({
            ...cursos[0],
            nombre_materia: 'Física',
        }),
        actualizando: false,
        errorActualizar: '',
        onArchivar: vi.fn().mockResolvedValue(true),
        onReactivar: vi.fn().mockResolvedValue(true),
        onEliminar: vi.fn().mockResolvedValue(true),
        procesandoId: null,
        errorAccion: '',
        mensajeAccion: '',
        onLimpiarAccion: vi.fn(),
        ...overrides,
    }
}

function obtenerFila(nombreMateria) {
    return screen.getByText(nombreMateria).closest('tr')
}

describe('Cursos', () => {
    it('muestra los cursos activos y archivados', () => {
        render(<Cursos {...crearProps()} />)

        expect(screen.getByText('Matemática')).toBeInTheDocument()
        expect(screen.getByText('Historia')).toBeInTheDocument()
        expect(screen.getByText('Archivado')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Reactivar' }))
            .toBeInTheDocument()
    })

    it('edita un curso y envía solo los campos del formulario', async () => {
        const user = userEvent.setup()
        const props = crearProps()

        render(<Cursos {...props} />)

        const fila = obtenerFila('Matemática')
        await user.click(
            within(fila).getByRole('button', { name: 'Editar' })
        )

        expect(screen.getByRole('heading', { name: 'Editar curso' }))
            .toBeInTheDocument()
        expect(props.onLimpiarAccion).toHaveBeenCalled()

        const materia = screen.getByDisplayValue('Matemática')
        await user.clear(materia)
        await user.type(materia, 'Física')
        await user.click(
            screen.getByRole('button', { name: 'Guardar cambios' })
        )

        expect(props.onActualizar).toHaveBeenCalledWith(1, {
            nombre_materia: 'Física',
            division: 'A',
            anio_lectivo: 2026,
            cantidad_periodos: 3,
        })
    })

    it('pide confirmación antes de archivar un curso', async () => {
        const user = userEvent.setup()
        const props = crearProps()

        render(<Cursos {...props} />)

        await user.click(
            within(obtenerFila('Matemática'))
                .getByRole('button', { name: 'Archivar' })
        )

        const confirmacion = screen
            .getByText(/¿Archivar este curso\?/)
            .parentElement

        await user.click(
            within(confirmacion).getByRole('button', { name: 'Archivar' })
        )

        expect(props.onArchivar).toHaveBeenCalledWith(1)
        expect(screen.queryByText(/¿Archivar este curso\?/))
            .not.toBeInTheDocument()
    })

    it('pide confirmación antes de eliminar y respeta el bloqueo', async () => {
        const user = userEvent.setup()
        const props = crearProps({
            onEliminar: vi.fn().mockResolvedValue(false),
        })

        render(<Cursos {...props} />)

        await user.click(
            within(obtenerFila('Matemática'))
                .getByRole('button', { name: 'Eliminar' })
        )

        const confirmacion = screen
            .getByText(/¿Eliminar este curso\?/)
            .parentElement

        await user.click(
            within(confirmacion).getByRole('button', { name: 'Eliminar' })
        )

        expect(props.onEliminar).toHaveBeenCalledWith(1)
        expect(screen.getByText(/¿Eliminar este curso\?/))
            .toBeInTheDocument()
    })

    it('reactiva un curso archivado sin pedir confirmación', async () => {
        const user = userEvent.setup()
        const props = crearProps()

        render(<Cursos {...props} />)

        await user.click(
            within(obtenerFila('Historia'))
                .getByRole('button', { name: 'Reactivar' })
        )

        expect(props.onReactivar).toHaveBeenCalledWith(2)
        expect(screen.queryByText(/¿Archivar este curso\?/))
            .not.toBeInTheDocument()
    })
})
