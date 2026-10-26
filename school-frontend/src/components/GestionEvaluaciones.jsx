import { useState } from "react"

import { formatearFecha } from "../academicoUtils"

function GestionEvaluaciones({
    curso,
    evaluaciones,
    procesando,
    onCrear,
    onActualizar,
    onEliminar,
    onLimpiarMensajes
}) {
    const [titulo, setTitulo] = useState("")
    const [fecha, setFecha] = useState("")
    const [periodo, setPeriodo] = useState("1")
    const [editandoId, setEditandoId] = useState(null)
    const [confirmarId, setConfirmarId] = useState(null)
    const [errorLocal, setErrorLocal] = useState("")

    function limpiarFormulario() {
        setTitulo("")
        setFecha("")
        setPeriodo("1")
        setEditandoId(null)
        setErrorLocal("")
    }

    function editar(evaluacion) {
        setTitulo(evaluacion.titulo)
        setFecha(evaluacion.fecha)
        setPeriodo(String(evaluacion.periodo))
        setEditandoId(evaluacion.id)
        setConfirmarId(null)
        setErrorLocal("")
        onLimpiarMensajes()
    }

    async function guardar(evento) {
        evento.preventDefault()
        setErrorLocal("")
        onLimpiarMensajes()

        const tituloLimpio = titulo.trim()
        const numeroPeriodo = Number(periodo)

        if (tituloLimpio.length === 0) {
            setErrorLocal("El título es obligatorio")
            return
        }

        if (!fecha) {
            setErrorLocal("La fecha es obligatoria")
            return
        }

        if (
            !Number.isInteger(numeroPeriodo)
            || numeroPeriodo < 1
            || numeroPeriodo > curso.cantidad_periodos
        ) {
            setErrorLocal(
                `El período debe estar entre 1 y ${curso.cantidad_periodos}`
            )
            return
        }

        const datos = {
            titulo: tituloLimpio,
            fecha,
            periodo: numeroPeriodo
        }

        if (editandoId !== null) {
            const actualizada = await onActualizar(editandoId, datos)

            if (actualizada) {
                limpiarFormulario()
            }

            return
        }

        const creada = await onCrear({
            curso_id: curso.id,
            ...datos
        })

        if (creada) {
            limpiarFormulario()
        }
    }

    async function eliminar(evaluacionId) {
        const eliminada = await onEliminar(evaluacionId)

        if (eliminada) {
            setConfirmarId(null)

            if (editandoId === evaluacionId) {
                limpiarFormulario()
            }
        }
    }

    return (
        <div className="academico-panel">
            <div className="academico-cabecera">
                <div>
                    <h3>Evaluaciones</h3>
                    <p className="academico-descripcion">
                        Cada evaluación pertenece a un período y se usa para
                        registrar las notas del curso.
                    </p>
                </div>

                <span className="academico-contador">
                    {evaluaciones.length} evaluaciones
                </span>
            </div>

            <form className="academico-formulario" onSubmit={guardar}>
                <h4>
                    {editandoId === null
                        ? "Nueva evaluación"
                        : "Editar evaluación"}
                </h4>

                <div className="academico-campos academico-campos-3">
                    <div className="academico-campo">
                        <label htmlFor="evaluacion-titulo">Título</label>
                        <input
                            id="evaluacion-titulo"
                            required
                            maxLength={150}
                            value={titulo}
                            onChange={(evento) =>
                                setTitulo(evento.target.value)
                            }
                            placeholder="Ej. Parcial 1"
                        />
                    </div>

                    <div className="academico-campo">
                        <label htmlFor="evaluacion-fecha">Fecha</label>
                        <input
                            id="evaluacion-fecha"
                            required
                            type="date"
                            value={fecha}
                            onChange={(evento) =>
                                setFecha(evento.target.value)
                            }
                        />
                    </div>

                    <div className="academico-campo">
                        <label htmlFor="evaluacion-periodo">Período</label>
                        <select
                            id="evaluacion-periodo"
                            value={periodo}
                            onChange={(evento) =>
                                setPeriodo(evento.target.value)
                            }
                        >
                            {Array.from(
                                { length: curso.cantidad_periodos },
                                (_, indice) => indice + 1
                            ).map((numero) => (
                                <option key={numero} value={numero}>
                                    Período {numero}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="academico-acciones">
                    <button type="submit" disabled={procesando}>
                        {procesando
                            ? "Guardando..."
                            : editandoId === null
                                ? "Crear evaluación"
                                : "Guardar cambios"}
                    </button>

                    {editandoId !== null && (
                        <button
                            type="button"
                            className="academico-secundario"
                            disabled={procesando}
                            onClick={limpiarFormulario}
                        >
                            Cancelar edición
                        </button>
                    )}
                </div>

                {errorLocal && (
                    <p className="mensaje-error" role="alert">
                        {errorLocal}
                    </p>
                )}
            </form>

            {evaluaciones.length === 0 ? (
                <p className="academico-vacio">
                    Todavía no hay evaluaciones para este curso.
                </p>
            ) : (
                <div className="tabla-contenedor">
                    <table className="tabla-alumnos">
                        <thead>
                            <tr>
                                <th>Título</th>
                                <th>Fecha</th>
                                <th>Período</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {evaluaciones.map((evaluacion) => (
                                <tr key={evaluacion.id}>
                                    <td>{evaluacion.titulo}</td>
                                    <td>{formatearFecha(evaluacion.fecha)}</td>
                                    <td>{evaluacion.periodo}</td>
                                    <td>
                                        <div className="academico-acciones-tabla">
                                            <button
                                                type="button"
                                                className="btn-secundario"
                                                disabled={procesando}
                                                onClick={() =>
                                                    editar(evaluacion)
                                                }
                                            >
                                                Editar
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-revocar"
                                                disabled={procesando}
                                                onClick={() =>
                                                    setConfirmarId(
                                                        evaluacion.id
                                                    )
                                                }
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {confirmarId !== null && (
                <div
                    className="academico-confirmacion"
                    role="alertdialog"
                    aria-label="Confirmar eliminación de evaluación"
                >
                    <p>
                        ¿Querés eliminar esta evaluación? La operación falla si
                        ya tiene calificaciones registradas.
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

export default GestionEvaluaciones
