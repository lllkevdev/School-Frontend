import { useState } from "react"

import {
    formatearFecha,
    nombreAlumno,
    ordenarAlumnos
} from "../academicoUtils"

function GestionInscripciones({
    curso,
    alumnos,
    cargandoAlumnos,
    errorAlumnos,
    inscripciones,
    procesando,
    onInscribir,
    onRegistrar,
    onQuitar,
    onLimpiarMensajes
}) {
    const [modo, setModo] = useState("existente")
    const [alumnoId, setAlumnoId] = useState("")
    const [nombre, setNombre] = useState("")
    const [apellido, setApellido] = useState("")
    const [documentoIdentidad, setDocumentoIdentidad] = useState("")
    const [fechaNacimiento, setFechaNacimiento] = useState("")
    const [pendiente, setPendiente] = useState(null)
    const [confirmarId, setConfirmarId] = useState(null)
    const [errorLocal, setErrorLocal] = useState("")

    const alumnosPorId = new Map(
        alumnos.map((alumno) => [alumno.id, alumno])
    )
    const idsInscriptos = new Set(
        inscripciones.map((inscripcion) => inscripcion.alumno_id)
    )
    const alumnosDisponibles = ordenarAlumnos(
        alumnos.filter(
            (alumno) => alumno.activo && !idsInscriptos.has(alumno.id)
        )
    )
    const inscripcionesOrdenadas = [...inscripciones].sort((a, b) => {
        const alumnoA = alumnosPorId.get(a.alumno_id)
        const alumnoB = alumnosPorId.get(b.alumno_id)

        if (!alumnoA || !alumnoB) {
            return a.alumno_id - b.alumno_id
        }

        return nombreAlumno(alumnoA).localeCompare(
            nombreAlumno(alumnoB),
            "es"
        )
    })

    function limpiarFormulario() {
        setNombre("")
        setApellido("")
        setDocumentoIdentidad("")
        setFechaNacimiento("")
    }

    function cambiarModo(nuevoModo) {
        setModo(nuevoModo)
        setPendiente(null)
        setErrorLocal("")
        onLimpiarMensajes()
    }

    async function inscribir(evento) {
        evento.preventDefault()
        setErrorLocal("")
        onLimpiarMensajes()

        if (!alumnoId) {
            setErrorLocal("Seleccioná un alumno")
            return
        }

        const inscripcion = await onInscribir(Number(alumnoId))

        if (inscripcion) {
            setAlumnoId("")
        }
    }

    function validarAlumnoNuevo() {
        if (nombre.trim().length < 2) {
            return "Ingresá el nombre del alumno"
        }

        if (apellido.trim().length < 2) {
            return "Ingresá el apellido del alumno"
        }

        if (documentoIdentidad.trim().length < 5) {
            return "El documento debe tener al menos 5 caracteres"
        }

        if (!fechaNacimiento) {
            return "Ingresá la fecha de nacimiento"
        }

        if (new Date(`${fechaNacimiento}T00:00:00`) > new Date()) {
            return "La fecha de nacimiento no puede ser futura"
        }

        return ""
    }

    async function registrar(evento) {
        evento.preventDefault()
        setErrorLocal("")
        setPendiente(null)
        onLimpiarMensajes()

        const error = validarAlumnoNuevo()

        if (error) {
            setErrorLocal(error)
            return
        }

        const datos = {
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            documento_identidad: documentoIdentidad.trim(),
            fecha_nacimiento: fechaNacimiento
        }
        const resultado = await onRegistrar(datos)

        if (resultado?.requiere_confirmacion) {
            setPendiente({
                datos,
                alumno: resultado.alumno
            })
            return
        }

        if (resultado) {
            limpiarFormulario()
        }
    }

    async function confirmarExistente() {
        if (!pendiente) {
            return
        }

        setErrorLocal("")
        onLimpiarMensajes()

        const resultado = await onRegistrar(pendiente.datos, true)

        if (resultado) {
            setPendiente(null)
            limpiarFormulario()
        }
    }

    async function quitar(inscripcionId) {
        const quitada = await onQuitar(inscripcionId)

        if (quitada) {
            setConfirmarId(null)
        }
    }

    return (
        <div className="academico-panel">
            <div className="academico-cabecera">
                <div>
                    <h3>Alumnos inscriptos</h3>
                    <p className="academico-descripcion">
                        Solo los alumnos inscriptos pueden recibir
                        calificaciones en {curso.nombre_materia}.
                    </p>
                </div>

                <span className="academico-contador">
                    {inscripciones.length} inscriptos
                </span>
            </div>

            <div
                className="academico-subtabs"
                role="tablist"
                aria-label="Cómo inscribir al alumno"
            >
                <button
                    type="button"
                    role="tab"
                    aria-selected={modo === "existente"}
                    className={modo === "existente" ? "activo" : ""}
                    onClick={() => cambiarModo("existente")}
                >
                    Alumno existente
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={modo === "nuevo"}
                    className={modo === "nuevo" ? "activo" : ""}
                    onClick={() => cambiarModo("nuevo")}
                >
                    Alumno nuevo
                </button>
            </div>

            {modo === "existente" && (
                <form className="academico-formulario" onSubmit={inscribir}>
                    <h4>Inscribir un alumno existente</h4>
                    <p className="academico-ayuda">
                        Elegí un alumno de la lista para sumarlo a{" "}
                        {curso.nombre_materia}.
                    </p>

                    <div className="academico-campos academico-campos-2">
                        <div className="academico-campo">
                            <label htmlFor="inscripcion-alumno">
                                Alumno
                            </label>
                            <select
                                id="inscripcion-alumno"
                                value={alumnoId}
                                onChange={(evento) => {
                                    setAlumnoId(evento.target.value)
                                    setErrorLocal("")
                                }}
                                disabled={
                                    cargandoAlumnos
                                    || alumnosDisponibles.length === 0
                                }
                            >
                                <option value="">Seleccionar alumno</option>
                                {alumnosDisponibles.map((alumno) => (
                                    <option key={alumno.id} value={alumno.id}>
                                        {nombreAlumno(alumno)} ·{" "}
                                        {alumno.documento_identidad}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="academico-campo academico-campo-accion">
                            <button
                                type="submit"
                                disabled={
                                    procesando
                                    || !alumnoId
                                    || alumnosDisponibles.length === 0
                                }
                            >
                                {procesando ? "Inscribiendo..." : "Inscribir"}
                            </button>
                        </div>
                    </div>

                    {cargandoAlumnos && (
                        <p className="academico-ayuda">
                            Cargando alumnos...
                        </p>
                    )}

                    {errorAlumnos && (
                        <p className="mensaje-error" role="alert">
                            {errorAlumnos}
                        </p>
                    )}

                    {!cargandoAlumnos
                        && !errorAlumnos
                        && alumnosDisponibles.length === 0 && (
                            <p className="academico-ayuda">
                                {inscripciones.length === 0
                                    ? "No hay alumnos activos disponibles para inscribir."
                                    : "Todos los alumnos activos ya están inscriptos."}
                            </p>
                        )}
                </form>
            )}

            {modo === "nuevo" && (
                <form className="academico-formulario" onSubmit={registrar}>
                    <h4>Registrar un alumno nuevo</h4>
                    <p className="academico-ayuda">
                        El perfil y la inscripción se crean juntos. Si el
                        documento ya existe, vas a poder revisarlo antes de
                        confirmar.
                    </p>

                    <div className="academico-campos academico-campos-4">
                        <div className="academico-campo">
                            <label htmlFor="inscripcion-nombre">
                                Nombre
                            </label>
                            <input
                                id="inscripcion-nombre"
                                value={nombre}
                                maxLength={100}
                                autoComplete="off"
                                onChange={(evento) => {
                                    setNombre(evento.target.value)
                                    setErrorLocal("")
                                }}
                            />
                        </div>

                        <div className="academico-campo">
                            <label htmlFor="inscripcion-apellido">
                                Apellido
                            </label>
                            <input
                                id="inscripcion-apellido"
                                value={apellido}
                                maxLength={100}
                                autoComplete="off"
                                onChange={(evento) => {
                                    setApellido(evento.target.value)
                                    setErrorLocal("")
                                }}
                            />
                        </div>

                        <div className="academico-campo">
                            <label htmlFor="inscripcion-documento">
                                Documento
                            </label>
                            <input
                                id="inscripcion-documento"
                                value={documentoIdentidad}
                                maxLength={20}
                                autoComplete="off"
                                onChange={(evento) => {
                                    setDocumentoIdentidad(evento.target.value)
                                    setErrorLocal("")
                                }}
                            />
                        </div>

                        <div className="academico-campo">
                            <label htmlFor="inscripcion-fecha">
                                Fecha de nacimiento
                            </label>
                            <input
                                id="inscripcion-fecha"
                                type="date"
                                value={fechaNacimiento}
                                onChange={(evento) => {
                                    setFechaNacimiento(evento.target.value)
                                    setErrorLocal("")
                                }}
                            />
                        </div>
                    </div>

                    <div className="academico-acciones">
                        <button type="submit" disabled={procesando}>
                            {procesando
                                ? "Registrando..."
                                : "Registrar e inscribir"}
                        </button>
                        <button
                            type="button"
                            className="btn-secundario"
                            disabled={procesando}
                            onClick={() => {
                                limpiarFormulario()
                                setPendiente(null)
                                setErrorLocal("")
                                onLimpiarMensajes()
                            }}
                        >
                            Limpiar
                        </button>
                    </div>
                </form>
            )}

            {pendiente && (
                <div
                    className="academico-revision"
                    role="region"
                    aria-live="polite"
                >
                    <p className="academico-etiqueta">Perfil existente</p>
                    <h4>{nombreAlumno(pendiente.alumno)}</h4>
                    <dl className="academico-revision-datos">
                        <div>
                            <dt>Documento</dt>
                            <dd>{pendiente.alumno.documento_identidad}</dd>
                        </div>
                        <div>
                            <dt>Nacimiento</dt>
                            <dd>
                                {formatearFecha(
                                    pendiente.alumno.fecha_nacimiento
                                )}
                            </dd>
                        </div>
                        <div>
                            <dt>Estado</dt>
                            <dd>
                                {pendiente.alumno.activo
                                    ? "Activo"
                                    : "Inactivo"}
                            </dd>
                        </div>
                    </dl>
                    <p>
                        Los datos del perfil no se van a modificar. Confirmá
                        para inscribirlo en{" "}
                        <strong>
                            {curso.nombre_materia} · {curso.division}
                        </strong>.
                    </p>
                    <div className="academico-acciones">
                        <button
                            type="button"
                            disabled={procesando}
                            onClick={confirmarExistente}
                        >
                            {procesando
                                ? "Inscribiendo..."
                                : "Confirmar e inscribir"}
                        </button>
                        <button
                            type="button"
                            className="btn-secundario"
                            disabled={procesando}
                            onClick={() => setPendiente(null)}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {errorLocal && (
                <p className="mensaje-error" role="alert">
                    {errorLocal}
                </p>
            )}

            {inscripciones.length === 0 ? (
                <p className="academico-vacio">
                    Todavía no hay alumnos inscriptos en este curso.
                </p>
            ) : (
                <div className="tabla-contenedor">
                    <table className="tabla-alumnos">
                        <thead>
                            <tr>
                                <th>Alumno</th>
                                <th>Documento</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {inscripcionesOrdenadas.map((inscripcion) => {
                                const alumno = alumnosPorId.get(
                                    inscripcion.alumno_id
                                )

                                return (
                                    <tr key={inscripcion.id}>
                                        <td>
                                            {alumno
                                                ? nombreAlumno(alumno)
                                                : `Alumno #${inscripcion.alumno_id}`}
                                        </td>
                                        <td>
                                            {alumno
                                                ? alumno.documento_identidad
                                                : "-"}
                                        </td>
                                        <td>
                                            {alumno && (
                                                <span
                                                    className={
                                                        alumno.activo
                                                            ? "alumno-estado activo"
                                                            : "alumno-estado inactivo"
                                                    }
                                                >
                                                    {alumno.activo
                                                        ? "Activo"
                                                        : "Inactivo"}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                className="btn-revocar"
                                                disabled={procesando}
                                                onClick={() =>
                                                    setConfirmarId(
                                                        inscripcion.id
                                                    )
                                                }
                                            >
                                                Quitar
                                            </button>
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
                    aria-label="Confirmar eliminación de inscripción"
                >
                    <p>
                        ¿Querés quitar esta inscripción? La operación falla si
                        el alumno ya tiene calificaciones en el curso.
                    </p>
                    <div className="academico-acciones">
                        <button
                            type="button"
                            className="btn-revocar"
                            disabled={procesando}
                            onClick={() => quitar(confirmarId)}
                        >
                            {procesando ? "Quitando..." : "Confirmar"}
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

export default GestionInscripciones
