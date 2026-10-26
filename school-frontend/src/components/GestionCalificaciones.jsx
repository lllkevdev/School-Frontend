import { useState } from "react"

import {
    calcularPromedio,
    formatearFecha,
    formatearNota,
    formatearPromedio,
    nombreAlumno,
    ordenarAlumnos
} from "../academicoUtils"

function GestionCalificaciones({
    alumnos,
    evaluaciones,
    calificaciones,
    inscripciones,
    procesando,
    onCrear,
    onActualizar,
    onEliminar,
    onExportar,
    exportando,
    errorExportar,
    onLimpiarMensajes
}) {
    const [evaluacionId, setEvaluacionId] = useState("")
    const [alumnoId, setAlumnoId] = useState("")
    const [nota, setNota] = useState("")
    const [editandoId, setEditandoId] = useState(null)
    const [notaEdicion, setNotaEdicion] = useState("")
    const [confirmarId, setConfirmarId] = useState(null)
    const [errorLocal, setErrorLocal] = useState("")

    const alumnosPorId = new Map(
        alumnos.map((alumno) => [alumno.id, alumno])
    )
    const evaluacionesPorId = new Map(
        evaluaciones.map((evaluacion) => [evaluacion.id, evaluacion])
    )
    const alumnosInscriptos = ordenarAlumnos(
        inscripciones
            .map((inscripcion) => alumnosPorId.get(inscripcion.alumno_id))
            .filter(Boolean)
    )

    const numeroEvaluacion = Number(evaluacionId)
    const alumnosCalificados = new Set(
        calificaciones
            .filter(
                (calificacion) =>
                    calificacion.evaluacion_id === numeroEvaluacion
            )
            .map((calificacion) => calificacion.alumno_id)
    )
    const alumnosDisponibles = alumnosInscriptos.filter(
        (alumno) => !alumnosCalificados.has(alumno.id)
    )

    const calificacionesOrdenadas = [...calificaciones].sort((a, b) => {
        const alumnoA = alumnosPorId.get(a.alumno_id)
        const alumnoB = alumnosPorId.get(b.alumno_id)
        const comparacionAlumnos = alumnoA && alumnoB
            ? nombreAlumno(alumnoA).localeCompare(
                nombreAlumno(alumnoB),
                "es"
            )
            : a.alumno_id - b.alumno_id

        if (comparacionAlumnos !== 0) {
            return comparacionAlumnos
        }

        const evaluacionA = evaluacionesPorId.get(a.evaluacion_id)
        const evaluacionB = evaluacionesPorId.get(b.evaluacion_id)

        if (!evaluacionA || !evaluacionB) {
            return a.evaluacion_id - b.evaluacion_id
        }

        return evaluacionA.fecha.localeCompare(evaluacionB.fecha)
    })

    const promedio = calcularPromedio(calificaciones)

    function validarNota(valor) {
        const numero = Number(String(valor).replace(",", "."))

        if (
            !Number.isFinite(numero)
            || numero < 1
            || numero > 10
        ) {
            return null
        }

        return numero
    }

    async function registrar(evento) {
        evento.preventDefault()
        setErrorLocal("")
        onLimpiarMensajes()

        if (!evaluacionId) {
            setErrorLocal("Seleccioná una evaluación")
            return
        }

        if (!alumnoId) {
            setErrorLocal("Seleccioná un alumno")
            return
        }

        const valor = validarNota(nota)

        if (valor === null) {
            setErrorLocal("La nota debe ser un número entre 1 y 10")
            return
        }

        const creada = await onCrear({
            alumno_id: Number(alumnoId),
            evaluacion_id: Number(evaluacionId),
            nota: valor
        })

        if (creada) {
            setAlumnoId("")
            setNota("")
        }
    }

    function editar(calificacion) {
        setEditandoId(calificacion.id)
        setNotaEdicion(String(calificacion.nota))
        setConfirmarId(null)
        setErrorLocal("")
        onLimpiarMensajes()
    }

    async function guardarEdicion(calificacionId) {
        setErrorLocal("")
        onLimpiarMensajes()

        const valor = validarNota(notaEdicion)

        if (valor === null) {
            setErrorLocal("La nota debe ser un número entre 1 y 10")
            return
        }

        const actualizada = await onActualizar(calificacionId, valor)

        if (actualizada) {
            setEditandoId(null)
            setNotaEdicion("")
        }
    }

    async function eliminar(calificacionId) {
        const eliminada = await onEliminar(calificacionId)

        if (eliminada) {
            setConfirmarId(null)

            if (editandoId === calificacionId) {
                setEditandoId(null)
                setNotaEdicion("")
            }
        }
    }

    function cambiarEvaluacion(valor) {
        setEvaluacionId(valor)
        setAlumnoId("")
        setErrorLocal("")
    }

    return (
        <div className="academico-panel">
            <div className="academico-cabecera">
                <div>
                    <h3>Calificaciones</h3>
                    <p className="academico-descripcion">
                        Notas de {calificaciones.length} registros
                        {promedio !== null && (
                            <> · Promedio del curso:{" "}
                                <strong>{formatearPromedio(promedio)}</strong>
                            </>
                        )}
                    </p>
                </div>

                <button
                    type="button"
                    className="btn-secundario"
                    disabled={
                        exportando || calificaciones.length === 0
                    }
                    onClick={onExportar}
                >
                    {exportando ? "Exportando..." : "Exportar CSV"}
                </button>
            </div>

            {errorExportar && (
                <p className="mensaje-error" role="alert">
                    {errorExportar}
                </p>
            )}

            <form className="academico-formulario" onSubmit={registrar}>
                <h4>Registrar calificación</h4>

                <div className="academico-campos academico-campos-3">
                    <div className="academico-campo">
                        <label htmlFor="calificacion-evaluacion">
                            Evaluación
                        </label>
                        <select
                            id="calificacion-evaluacion"
                            value={evaluacionId}
                            onChange={(evento) =>
                                cambiarEvaluacion(evento.target.value)
                            }
                            disabled={evaluaciones.length === 0}
                        >
                            <option value="">Seleccionar evaluación</option>
                            {evaluaciones.map((evaluacion) => (
                                <option
                                    key={evaluacion.id}
                                    value={evaluacion.id}
                                >
                                    {evaluacion.titulo} · Período{" "}
                                    {evaluacion.periodo} ·{" "}
                                    {formatearFecha(evaluacion.fecha)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="academico-campo">
                        <label htmlFor="calificacion-alumno">Alumno</label>
                        <select
                            id="calificacion-alumno"
                            value={alumnoId}
                            onChange={(evento) =>
                                setAlumnoId(evento.target.value)
                            }
                            disabled={
                                !evaluacionId
                                || alumnosDisponibles.length === 0
                            }
                        >
                            <option value="">Seleccionar alumno</option>
                            {alumnosDisponibles.map((alumno) => (
                                <option key={alumno.id} value={alumno.id}>
                                    {nombreAlumno(alumno)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="academico-campo">
                        <label htmlFor="calificacion-nota">Nota</label>
                        <input
                            id="calificacion-nota"
                            type="number"
                            min={1}
                            max={10}
                            step={0.1}
                            value={nota}
                            onChange={(evento) =>
                                setNota(evento.target.value)
                            }
                            placeholder="Ej. 8,5"
                        />
                    </div>
                </div>

                <div className="academico-acciones">
                    <button
                        type="submit"
                        disabled={
                            procesando
                            || evaluaciones.length === 0
                            || alumnosInscriptos.length === 0
                        }
                    >
                        {procesando ? "Guardando..." : "Registrar nota"}
                    </button>
                </div>

                {evaluaciones.length === 0 && (
                    <p className="academico-ayuda">
                        Primero creá una evaluación en la pestaña
                        Evaluaciones.
                    </p>
                )}

                {evaluaciones.length > 0
                    && alumnosInscriptos.length === 0 && (
                        <p className="academico-ayuda">
                            Primero inscribí alumnos en la pestaña
                            Inscripciones.
                        </p>
                    )}

                {evaluacionId
                    && alumnosInscriptos.length > 0
                    && alumnosDisponibles.length === 0 && (
                        <p className="academico-ayuda">
                            Todos los alumnos inscriptos ya tienen nota en
                            esta evaluación.
                        </p>
                    )}

                {errorLocal && (
                    <p className="mensaje-error" role="alert">
                        {errorLocal}
                    </p>
                )}
            </form>

            {calificaciones.length === 0 ? (
                <p className="academico-vacio">
                    Todavía no hay calificaciones registradas en este curso.
                </p>
            ) : (
                <div className="tabla-contenedor">
                    <table className="tabla-alumnos">
                        <thead>
                            <tr>
                                <th>Alumno</th>
                                <th>Evaluación</th>
                                <th>Nota</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {calificacionesOrdenadas.map((calificacion) => {
                                const alumno = alumnosPorId.get(
                                    calificacion.alumno_id
                                )
                                const evaluacion = evaluacionesPorId.get(
                                    calificacion.evaluacion_id
                                )
                                const estaEditando =
                                    editandoId === calificacion.id

                                return (
                                    <tr key={calificacion.id}>
                                        <td>
                                            {alumno
                                                ? nombreAlumno(alumno)
                                                : `Alumno #${calificacion.alumno_id}`}
                                        </td>
                                        <td>
                                            {evaluacion
                                                ? `${evaluacion.titulo} · Período ${evaluacion.periodo}`
                                                : `Evaluación #${calificacion.evaluacion_id}`}
                                        </td>
                                        <td>
                                            {estaEditando ? (
                                                <input
                                                    className="academico-nota-input"
                                                    type="number"
                                                    min={1}
                                                    max={10}
                                                    step={0.1}
                                                    value={notaEdicion}
                                                    aria-label="Nueva nota"
                                                    onChange={(evento) =>
                                                        setNotaEdicion(
                                                            evento.target.value
                                                        )
                                                    }
                                                />
                                            ) : (
                                                <strong>
                                                    {formatearNota(
                                                        calificacion.nota
                                                    )}
                                                </strong>
                                            )}
                                        </td>
                                        <td>
                                            <div className="academico-acciones-tabla">
                                                {estaEditando ? (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className="btn-secundario"
                                                            disabled={
                                                                procesando
                                                            }
                                                            onClick={() =>
                                                                guardarEdicion(
                                                                    calificacion.id
                                                                )
                                                            }
                                                        >
                                                            Guardar
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn-secundario"
                                                            disabled={
                                                                procesando
                                                            }
                                                            onClick={() => {
                                                                setEditandoId(
                                                                    null
                                                                )
                                                                setNotaEdicion("")
                                                            }}
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className="btn-secundario"
                                                            disabled={
                                                                procesando
                                                            }
                                                            onClick={() =>
                                                                editar(
                                                                    calificacion
                                                                )
                                                            }
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn-revocar"
                                                            disabled={
                                                                procesando
                                                            }
                                                            onClick={() =>
                                                                setConfirmarId(
                                                                    calificacion.id
                                                                )
                                                            }
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {confirmarId !== null && (
                <div
                    className="academico-confirmacion"
                    role="alertdialog"
                    aria-label="Confirmar eliminación de calificación"
                >
                    <p>
                        ¿Querés eliminar esta calificación? Esta acción no se
                        puede deshacer.
                    </p>
                    <div className="academico-acciones">
                        <button
                            type="button"
                            className="btn-revocar"
                            disabled={procesando}
                            onClick={() => eliminar(confirmarId)}
                        >
                            {procesando ? "Eliminando..." : "Confirmar"}
                        </button>
                        <button
                            type="button"
                            className="btn-secundario"
                            disabled={procesando}
                            onClick={() => setConfirmarId(null)}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default GestionCalificaciones
