import { useState } from "react"

import FormularioCurso from "./FormularioCurso"

function Cursos({
    cursos,
    cargando,
    errorCarga,
    onCrear,
    creando,
    errorCrear,
    onActualizar,
    actualizando,
    errorActualizar,
    onArchivar,
    onReactivar,
    onEliminar,
    procesandoId,
    errorAccion,
    mensajeAccion,
    onLimpiarAccion
}) {
    const [cursoEditando, setCursoEditando] = useState(null)
    const [confirmacion, setConfirmacion] = useState(null)

    function abrirEdicion(curso) {
        onLimpiarAccion()
        setCursoEditando(curso)
    }

    function cerrarEdicion() {
        setCursoEditando(null)
        onLimpiarAccion()
    }

    function pedirConfirmacion(tipo, curso) {
        onLimpiarAccion()
        setConfirmacion({ tipo, curso })
    }

    function cancelarConfirmacion() {
        setConfirmacion(null)
        onLimpiarAccion()
    }

    async function guardarEdicion(datos) {
        if (!cursoEditando) {
            return null
        }

        const cursoId = cursoEditando.id
        const actualizado = await onActualizar(cursoId, datos)

        if (actualizado) {
            setCursoEditando(null)
        }

        return actualizado
    }

    async function confirmarAccion() {
        if (!confirmacion) {
            return
        }

        const { tipo, curso } = confirmacion
        const completado = tipo === "archivar"
            ? await onArchivar(curso.id)
            : await onEliminar(curso.id)

        if (completado) {
            setConfirmacion(null)
        }
    }

    async function reactivar(curso) {
        onLimpiarAccion()
        await onReactivar(curso.id)
    }

    return (
        <section className="cursos-seccion">
            {cursoEditando ? (
                <FormularioCurso
                    key={cursoEditando.id}
                    curso={cursoEditando}
                    onGuardar={guardarEdicion}
                    guardando={actualizando}
                    error={errorActualizar}
                    onCancelar={cerrarEdicion}
                />
            ) : (
                <FormularioCurso
                    onGuardar={onCrear}
                    guardando={creando}
                    error={errorCrear}
                />
            )}

            <h2>Cursos existentes</h2>

            {cargando && <p>Cargando cursos...</p>}

            {errorCarga && (
                <p className="mensaje-error" role="alert">
                    {errorCarga}
                </p>
            )}

            {!confirmacion && mensajeAccion && (
                <p className="academico-mensaje-exito" role="status">
                    {mensajeAccion}
                </p>
            )}

            {!confirmacion && errorAccion && (
                <p className="mensaje-error" role="alert">
                    {errorAccion}
                </p>
            )}

            {!cargando && !errorCarga && (
                <div className="tabla-contenedor">
                    <table className="tabla-alumnos">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Materia</th>
                                <th>División</th>
                                <th>Año</th>
                                <th>Períodos</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {cursos.length === 0 ? (
                                <tr>
                                    <td colSpan={7}>
                                        No hay cursos para mostrar.
                                    </td>
                                </tr>
                            ) : (
                                cursos.map((curso) => (
                                    <tr key={curso.id}>
                                        <td>{curso.id}</td>
                                        <td>{curso.nombre_materia}</td>
                                        <td>{curso.division}</td>
                                        <td>{curso.anio_lectivo}</td>
                                        <td>{curso.cantidad_periodos}</td>
                                        <td>
                                            <span
                                                className={
                                                    curso.activo
                                                        ? "alumno-estado activo"
                                                        : "alumno-estado inactivo"
                                                }
                                            >
                                                {curso.activo
                                                    ? "Activo"
                                                    : "Archivado"}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="acciones-curso">
                                                <button
                                                    type="button"
                                                    className="btn-secundario"
                                                    onClick={() => abrirEdicion(curso)}
                                                    disabled={procesandoId === curso.id}
                                                >
                                                    Editar
                                                </button>

                                                {curso.activo ? (
                                                    <button
                                                        type="button"
                                                        className="btn-secundario"
                                                        onClick={() => pedirConfirmacion("archivar", curso)}
                                                        disabled={procesandoId === curso.id}
                                                    >
                                                        {procesandoId === curso.id
                                                            ? "Procesando..."
                                                            : "Archivar"}
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className="btn-secundario"
                                                        onClick={() => reactivar(curso)}
                                                        disabled={procesandoId === curso.id}
                                                    >
                                                        {procesandoId === curso.id
                                                            ? "Procesando..."
                                                            : "Reactivar"}
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    className="btn-revocar"
                                                    onClick={() => pedirConfirmacion("eliminar", curso)}
                                                    disabled={procesandoId === curso.id}
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {confirmacion && (
                <div className="confirmacion-eliminacion">
                    <p>
                        {confirmacion.tipo === "archivar"
                            ? "¿Archivar este curso? No se podrán inscribir alumnos ni registrar nuevas notas mientras esté archivado. Podés reactivarlo cuando quieras."
                            : "¿Eliminar este curso? Solo es posible si no tiene alumnos, evaluaciones ni invitaciones. Esta acción no se puede deshacer."}
                    </p>

                    {errorAccion && (
                        <p className="mensaje-error" role="alert">
                            {errorAccion}
                        </p>
                    )}

                    <button
                        disabled={procesandoId !== null}
                        onClick={confirmarAccion}
                    >
                        {procesandoId !== null
                            ? "Procesando..."
                            : confirmacion.tipo === "archivar"
                                ? "Archivar"
                                : "Eliminar"}
                    </button>

                    <button
                        onClick={cancelarConfirmacion}
                        disabled={procesandoId !== null}
                    >
                        Cancelar
                    </button>
                </div>
            )}
        </section>
    )
}

export default Cursos
