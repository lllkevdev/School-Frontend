import { useState } from "react"

import useAcademicoAdmin from "../hooks/useAcademicoAdmin"
import GestionCalificaciones from "./GestionCalificaciones"
import GestionEvaluaciones from "./GestionEvaluaciones"
import GestionInscripciones from "./GestionInscripciones"

const PESTANAS = [
    { id: "evaluaciones", nombre: "Evaluaciones" },
    { id: "calificaciones", nombre: "Calificaciones" },
    { id: "inscripciones", nombre: "Inscripciones" }
]

function AcademicoAdmin({
    token,
    cerrarSesion,
    cursos,
    cargandoCursos,
    errorCursos,
    alumnos,
    cargandoAlumnos,
    errorAlumnos,
    onAlumnoRegistrado,
    onIrACursos
}) {
    const [pestanaActiva, setPestanaActiva] = useState("evaluaciones")

    const {
        cursoId,
        cursoSeleccionado,
        seleccionarCurso,
        evaluaciones,
        calificaciones,
        inscripciones,
        cargando,
        errorCarga,
        procesando,
        errorOperacion,
        mensajeOperacion,
        limpiarMensajes,
        crearEvaluacion,
        actualizarEvaluacion,
        eliminarEvaluacion,
        crearCalificacion,
        actualizarCalificacion,
        eliminarCalificacion,
        inscribirAlumno,
        registrarAlumnoConInscripcion,
        quitarInscripcion,
        descargarCalificaciones,
        exportando,
        errorExportar
    } = useAcademicoAdmin(
        token,
        cerrarSesion,
        cursos,
        onAlumnoRegistrado
    )

    function cambiarPestana(id) {
        setPestanaActiva(id)
        limpiarMensajes()
    }

    function contarPestana(id) {
        if (id === "evaluaciones") {
            return evaluaciones.length
        }

        if (id === "calificaciones") {
            return calificaciones.length
        }

        return inscripciones.length
    }

    return (
        <section className="academico-seccion">
            <div className="academico-encabezado">
                <div>
                    <p className="academico-etiqueta">Gestión académica</p>
                    <h2>Curso y calificaciones</h2>
                    <p className="academico-descripcion">
                        Elegí un curso para administrar inscripciones,
                        evaluaciones y notas.
                    </p>
                </div>

                {cursos.length > 0 && (
                    <div className="academico-selector">
                        <label htmlFor="academico-curso">Curso</label>
                        <select
                            id="academico-curso"
                            value={cursoId || ""}
                            onChange={(evento) =>
                                seleccionarCurso(evento.target.value)
                            }
                        >
                            {cursos.map((curso) => (
                                <option key={curso.id} value={curso.id}>
                                    {curso.nombre_materia} · {curso.division} ·{" "}
                                    {curso.anio_lectivo}
                                    {curso.activo ? "" : " (inactivo)"}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {cargandoCursos && (
                <p className="academico-vacio">Cargando cursos...</p>
            )}

            {errorCursos && (
                <p className="mensaje-error" role="alert">
                    {errorCursos}
                </p>
            )}

            {!cargandoCursos
                && !errorCursos
                && cursos.length === 0 && (
                    <div className="academico-vacio academico-vacio-panel">
                        <h3>Todavía no hay cursos</h3>
                        <p>
                            Creá un curso para poder cargar evaluaciones y
                            calificaciones.
                        </p>
                        {onIrACursos && (
                            <button
                                type="button"
                                className="btn-secundario"
                                onClick={onIrACursos}
                            >
                                Ir a Cursos
                            </button>
                        )}
                    </div>
                )}

            {cursoSeleccionado && (
                <>
                    <div className="academico-curso">
                        <div>
                            <p className="academico-etiqueta">
                                Curso seleccionado
                            </p>
                            <h3>
                                {cursoSeleccionado.nombre_materia} ·{" "}
                                {cursoSeleccionado.division}
                            </h3>
                            <p className="academico-descripcion">
                                Año {cursoSeleccionado.anio_lectivo} ·{" "}
                                {cursoSeleccionado.cantidad_periodos} períodos
                            </p>
                        </div>

                        <span
                            className={
                                cursoSeleccionado.activo
                                    ? "alumno-estado activo"
                                    : "alumno-estado inactivo"
                            }
                        >
                            {cursoSeleccionado.activo
                                ? "Activo"
                                : "Inactivo"}
                        </span>
                    </div>

                    {!cursoSeleccionado.activo && (
                        <p className="academico-aviso" role="status">
                            El curso está inactivo: no se pueden crear
                            evaluaciones, inscribir alumnos ni registrar
                            nuevas notas.
                        </p>
                    )}

                    <nav
                        className="academico-tabs"
                        aria-label="Secciones del curso"
                    >
                        {PESTANAS.map((pestana) => (
                            <button
                                key={pestana.id}
                                type="button"
                                className={
                                    pestanaActiva === pestana.id
                                        ? "activo"
                                        : ""
                                }
                                aria-pressed={
                                    pestanaActiva === pestana.id
                                }
                                onClick={() => cambiarPestana(pestana.id)}
                            >
                                {pestana.nombre}
                                <span className="academico-tab-contador">
                                    {contarPestana(pestana.id)}
                                </span>
                            </button>
                        ))}
                    </nav>

                    {mensajeOperacion && (
                        <p
                            className="academico-mensaje-exito"
                            role="status"
                        >
                            {mensajeOperacion}
                        </p>
                    )}

                    {errorOperacion && (
                        <p className="mensaje-error" role="alert">
                            {errorOperacion}
                        </p>
                    )}

                    {cargando ? (
                        <p className="academico-vacio">
                            Cargando datos del curso...
                        </p>
                    ) : errorCarga ? (
                        <p className="mensaje-error" role="alert">
                            {errorCarga}
                        </p>
                    ) : (
                        <>
                            {pestanaActiva === "evaluaciones" && (
                                <GestionEvaluaciones
                                    key={`evaluaciones-${cursoSeleccionado.id}`}
                                    curso={cursoSeleccionado}
                                    evaluaciones={evaluaciones}
                                    procesando={procesando}
                                    onCrear={crearEvaluacion}
                                    onActualizar={actualizarEvaluacion}
                                    onEliminar={eliminarEvaluacion}
                                    onLimpiarMensajes={limpiarMensajes}
                                />
                            )}

                            {pestanaActiva === "calificaciones" && (
                                <GestionCalificaciones
                                    key={`calificaciones-${cursoSeleccionado.id}`}
                                    alumnos={alumnos}
                                    evaluaciones={evaluaciones}
                                    calificaciones={calificaciones}
                                    inscripciones={inscripciones}
                                    procesando={procesando}
                                    onCrear={crearCalificacion}
                                    onActualizar={actualizarCalificacion}
                                    onEliminar={eliminarCalificacion}
                                    onExportar={descargarCalificaciones}
                                    exportando={exportando}
                                    errorExportar={errorExportar}
                                    onLimpiarMensajes={limpiarMensajes}
                                />
                            )}

                            {pestanaActiva === "inscripciones" && (
                                <GestionInscripciones
                                    key={`inscripciones-${cursoSeleccionado.id}`}
                                    curso={cursoSeleccionado}
                                    alumnos={alumnos}
                                    cargandoAlumnos={cargandoAlumnos}
                                    errorAlumnos={errorAlumnos}
                                    inscripciones={inscripciones}
                                    procesando={procesando}
                                    onInscribir={inscribirAlumno}
                                    onRegistrar={registrarAlumnoConInscripcion}
                                    onQuitar={quitarInscripcion}
                                    onLimpiarMensajes={limpiarMensajes}
                                />
                            )}
                        </>
                    )}
                </>
            )}
        </section>
    )
}

export default AcademicoAdmin
