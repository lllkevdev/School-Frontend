import { useState } from "react"

import {
    calcularPromedio,
    formatearFecha,
    formatearNota,
    formatearPromedio,
    nombreCurso
} from "../academicoUtils"
import useAcademicoAlumno from "../hooks/useAcademicoAlumno"

const PESTANAS = [
    { id: "cursos", nombre: "Mis cursos" },
    { id: "evaluaciones", nombre: "Evaluaciones" },
    { id: "calificaciones", nombre: "Calificaciones" }
]

function AcademicoAlumno({ token, cerrarSesion }) {
    const [pestanaActiva, setPestanaActiva] = useState("cursos")
    const [cursoFiltro, setCursoFiltro] = useState("todos")

    const {
        cursos,
        evaluaciones,
        calificaciones,
        cargando,
        errorCarga
    } = useAcademicoAlumno(token, cerrarSesion, true)

    const cursosPorId = new Map(
        cursos.map((curso) => [curso.id, curso])
    )

    const evaluacionesFiltradas = evaluaciones
        .filter(
            (evaluacion) =>
                cursoFiltro === "todos"
                || evaluacion.curso_id === Number(cursoFiltro)
        )
        .sort((a, b) => {
            const fecha = a.fecha.localeCompare(b.fecha)

            if (fecha !== 0) {
                return fecha
            }

            return a.id - b.id
        })

    const calificacionesFiltradas = calificaciones
        .filter(
            (calificacion) =>
                cursoFiltro === "todos"
                || calificacion.curso_id === Number(cursoFiltro)
        )
        .sort((a, b) => {
            const cursoA = cursosPorId.get(a.curso_id)
            const cursoB = cursosPorId.get(b.curso_id)
            const comparacionCurso = cursoA && cursoB
                ? cursoA.nombre_materia.localeCompare(
                    cursoB.nombre_materia,
                    "es"
                )
                : a.curso_id - b.curso_id

            if (comparacionCurso !== 0) {
                return comparacionCurso
            }

            return a.evaluacion.fecha.localeCompare(b.evaluacion.fecha)
        })

    const promedio = calcularPromedio(calificacionesFiltradas)

    function verCurso(cursoId) {
        setCursoFiltro(String(cursoId))
        setPestanaActiva("evaluaciones")
    }

    function contarPestana(id) {
        if (id === "cursos") {
            return cursos.length
        }

        if (id === "evaluaciones") {
            return evaluacionesFiltradas.length
        }

        return calificacionesFiltradas.length
    }

    if (cargando) {
        return (
            <section className="academico-seccion">
                <p className="academico-vacio">
                    Cargando tus datos académicos...
                </p>
            </section>
        )
    }

    if (errorCarga) {
        return (
            <section className="academico-seccion">
                <p className="mensaje-error" role="alert">
                    {errorCarga}
                </p>
            </section>
        )
    }

    return (
        <section className="academico-seccion">
            <div className="academico-encabezado">
                <div>
                    <p className="academico-etiqueta">Mi recorrido</p>
                    <h2>Resumen académico</h2>
                    <p className="academico-descripcion">
                        Consultá tus cursos, las evaluaciones programadas y
                        las notas registradas.
                    </p>
                </div>

                {cursos.length > 0 && (
                    <div className="academico-selector">
                        <label htmlFor="alumno-curso">Filtrar por curso</label>
                        <select
                            id="alumno-curso"
                            value={cursoFiltro}
                            onChange={(evento) =>
                                setCursoFiltro(evento.target.value)
                            }
                        >
                            <option value="todos">Todos los cursos</option>
                            {cursos.map((curso) => (
                                <option key={curso.id} value={curso.id}>
                                    {nombreCurso(curso)}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="academico-resumen">
                <div className="academico-stat">
                    <span>Cursos</span>
                    <strong>{cursos.length}</strong>
                </div>
                <div className="academico-stat">
                    <span>Evaluaciones</span>
                    <strong>{evaluacionesFiltradas.length}</strong>
                </div>
                <div className="academico-stat">
                    <span>Notas</span>
                    <strong>{calificacionesFiltradas.length}</strong>
                </div>
                <div className="academico-stat">
                    <span>Promedio</span>
                    <strong>
                        {promedio === null
                            ? "—"
                            : formatearPromedio(promedio)}
                    </strong>
                </div>
            </div>

            <nav
                className="academico-tabs"
                aria-label="Secciones académicas"
            >
                {PESTANAS.map((pestana) => (
                    <button
                        key={pestana.id}
                        type="button"
                        className={
                            pestanaActiva === pestana.id ? "activo" : ""
                        }
                        aria-pressed={pestanaActiva === pestana.id}
                        onClick={() => setPestanaActiva(pestana.id)}
                    >
                        {pestana.nombre}
                        <span className="academico-tab-contador">
                            {contarPestana(pestana.id)}
                        </span>
                    </button>
                ))}
            </nav>

            {pestanaActiva === "cursos" && (
                <div className="academico-panel">
                    {cursos.length === 0 ? (
                        <div className="academico-vacio academico-vacio-panel">
                            <h3>Todavía no tenés cursos</h3>
                            <p>
                                Cuando aceptes una invitación o te inscriban
                                en un curso, aparecerá acá.
                            </p>
                        </div>
                    ) : (
                        <div className="academico-cursos-grid">
                            {cursos.map((curso) => (
                                <article
                                    key={curso.id}
                                    className="academico-curso-card"
                                >
                                    <div className="academico-curso-card-cabecera">
                                        <p className="academico-etiqueta">
                                            {curso.anio_lectivo}
                                        </p>
                                        <span className="alumno-estado activo">
                                            Activo
                                        </span>
                                    </div>

                                    <h3>{curso.nombre_materia}</h3>
                                    <p className="academico-descripcion">
                                        División {curso.division}
                                    </p>

                                    <button
                                        type="button"
                                        className="btn-secundario"
                                        onClick={() => verCurso(curso.id)}
                                    >
                                        Ver evaluaciones
                                    </button>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {pestanaActiva === "evaluaciones" && (
                <div className="academico-panel">
                    <div className="academico-cabecera">
                        <div>
                            <h3>Evaluaciones</h3>
                            <p className="academico-descripcion">
                                Fechas de las evaluaciones de tus cursos.
                            </p>
                        </div>
                        <span className="academico-contador">
                            {evaluacionesFiltradas.length} evaluaciones
                        </span>
                    </div>

                    {evaluacionesFiltradas.length === 0 ? (
                        <p className="academico-vacio">
                            No hay evaluaciones para el filtro seleccionado.
                        </p>
                    ) : (
                        <div className="tabla-contenedor">
                            <table className="tabla-alumnos">
                                <thead>
                                    <tr>
                                        <th>Curso</th>
                                        <th>Evaluación</th>
                                        <th>Fecha</th>
                                        <th>Período</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {evaluacionesFiltradas.map(
                                        (evaluacion) => (
                                            <tr key={evaluacion.id}>
                                                <td>
                                                    {evaluacion.curso
                                                        .nombre_materia}
                                                    {" · "}
                                                    {evaluacion.curso.division}
                                                </td>
                                                <td>{evaluacion.titulo}</td>
                                                <td>
                                                    {formatearFecha(
                                                        evaluacion.fecha
                                                    )}
                                                </td>
                                                <td>{evaluacion.periodo}</td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {pestanaActiva === "calificaciones" && (
                <div className="academico-panel">
                    <div className="academico-cabecera">
                        <div>
                            <h3>Calificaciones</h3>
                            <p className="academico-descripcion">
                                Notas registradas
                                {promedio !== null && (
                                    <> · Promedio:{" "}
                                        <strong>
                                            {formatearPromedio(promedio)}
                                        </strong>
                                    </>
                                )}
                            </p>
                        </div>
                        <span className="academico-contador">
                            {calificacionesFiltradas.length} notas
                        </span>
                    </div>

                    {calificacionesFiltradas.length === 0 ? (
                        <p className="academico-vacio">
                            No hay calificaciones para el filtro seleccionado.
                        </p>
                    ) : (
                        <div className="tabla-contenedor">
                            <table className="tabla-alumnos">
                                <thead>
                                    <tr>
                                        <th>Curso</th>
                                        <th>Evaluación</th>
                                        <th>Período</th>
                                        <th>Nota</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {calificacionesFiltradas.map(
                                        (calificacion) => (
                                            <tr key={calificacion.id}>
                                                <td>
                                                    {calificacion.curso
                                                        .nombre_materia}
                                                    {" · "}
                                                    {
                                                        calificacion.curso
                                                            .division
                                                    }
                                                </td>
                                                <td>
                                                    {
                                                        calificacion
                                                            .evaluacion.titulo
                                                    }
                                                </td>
                                                <td>
                                                    {
                                                        calificacion
                                                            .evaluacion.periodo
                                                    }
                                                </td>
                                                <td>
                                                    <strong>
                                                        {formatearNota(
                                                            calificacion.nota
                                                        )}
                                                    </strong>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </section>
    )
}

export default AcademicoAlumno
