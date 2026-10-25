import { useState } from "react"

function formatearFechaHora(fecha) {
    if (!fecha) {
        return "-"
    }

    const valor = new Date(fecha)

    if (Number.isNaN(valor.getTime())) {
        return "-"
    }

    return valor.toLocaleString("es-AR", {
        dateStyle: "short",
        timeStyle: "short"
    })
}

function obtenerEstado(invitacion, ahora) {
    if (invitacion.aceptada_en) {
        return { texto: "Aceptada", clase: "aceptada" }
    }

    if (invitacion.revocada) {
        return { texto: "Revocada", clase: "revocada" }
    }

    const expira = new Date(invitacion.expira_en).getTime()

    if (!Number.isNaN(expira) && expira <= ahora) {
        return { texto: "Vencida", clase: "vencida" }
    }

    return { texto: "Pendiente", clase: "pendiente" }
}

function Invitaciones({
    alumnos,
    cursos,
    cargandoAlumnos,
    errorAlumnos,
    invitaciones,
    cargando,
    errorCarga,
    onCrear,
    creando,
    errorCrear,
    creada,
    onRevocar,
    revocandoId,
    errorRevocar
}) {
    const [alumnoId, setAlumnoId] = useState("")
    const [cursoId, setCursoId] = useState("")
    const [email, setEmail] = useState("")
    const [errorLocal, setErrorLocal] = useState("")
    const [copiado, setCopiado] = useState(false)
    const [errorCopia, setErrorCopia] = useState("")
    const [ahora] = useState(() => Date.now())

    const alumnosDisponibles = alumnos.filter((alumno) => alumno.activo)
    const cursosDisponibles = cursos.filter((curso) => curso.activo)

    const alumnosPorId = new Map(
        alumnos.map((alumno) => [alumno.id, alumno])
    )
    const cursosPorId = new Map(
        cursos.map((curso) => [curso.id, curso])
    )

    const enlace = creada
        ? `${window.location.origin}/?invitacion=${
            encodeURIComponent(creada.token)
        }`
        : ""

    async function crear(evento) {
        evento.preventDefault()
        setErrorLocal("")
        setErrorCopia("")

        if (!alumnoId) {
            setErrorLocal("Seleccioná un alumno")
            return
        }

        if (!cursoId) {
            setErrorLocal("Seleccioná un curso")
            return
        }

        const correo = email.trim()

        if (!correo || !correo.includes("@")) {
            setErrorLocal("Ingresá un correo válido")
            return
        }

        const nueva = await onCrear({
            alumno_id: Number(alumnoId),
            curso_id: Number(cursoId),
            email: correo
        })

        if (nueva) {
            setEmail("")
            setCopiado(false)
        }
    }

    function copiarConSeleccion() {
        const campo = document.createElement("textarea")
        campo.value = enlace
        campo.setAttribute("readonly", "")
        campo.style.position = "fixed"
        campo.style.opacity = "0"
        document.body.appendChild(campo)
        campo.select()

        const copiadoConExito = document.execCommand("copy")
        document.body.removeChild(campo)

        if (!copiadoConExito) {
            throw new Error("No se pudo copiar")
        }
    }

    async function copiarEnlace() {
        setErrorCopia("")

        try {
            if (navigator.clipboard && window.isSecureContext) {
                try {
                    await navigator.clipboard.writeText(enlace)
                } catch {
                    copiarConSeleccion()
                }
            } else {
                copiarConSeleccion()
            }

            setCopiado(true)
        } catch {
            setErrorCopia("No se pudo copiar el enlace")
        }
    }

    return (
        <section className="invitaciones-seccion">
            <form className="formulario-invitacion" onSubmit={crear}>
                <h2>Crear invitación</h2>
                <p>
                    El alumno usará el enlace para crear su cuenta y quedará
                    inscripto automáticamente en el curso.
                </p>

                {cargandoAlumnos && <p>Cargando alumnos...</p>}

                {errorAlumnos && (
                    <p className="mensaje-error" role="alert">
                        {errorAlumnos}
                    </p>
                )}

                <label htmlFor="invitacion-alumno">Alumno</label>
                <select
                    id="invitacion-alumno"
                    required
                    value={alumnoId}
                    onChange={(e) => setAlumnoId(e.target.value)}
                    disabled={alumnosDisponibles.length === 0}
                >
                    <option value="">Seleccionar alumno</option>
                    {alumnosDisponibles.map((alumno) => (
                        <option key={alumno.id} value={alumno.id}>
                            {alumno.apellido}, {alumno.nombre}
                        </option>
                    ))}
                </select>

                {alumnosDisponibles.length === 0 && !cargandoAlumnos && (
                    <p className="texto-ayuda">
                        No hay alumnos activos. Creá uno desde la sección
                        Alumnos.
                    </p>
                )}

                <label htmlFor="invitacion-curso">Curso</label>
                <select
                    id="invitacion-curso"
                    required
                    value={cursoId}
                    onChange={(e) => setCursoId(e.target.value)}
                    disabled={cursosDisponibles.length === 0}
                >
                    <option value="">Seleccionar curso</option>
                    {cursosDisponibles.map((curso) => (
                        <option key={curso.id} value={curso.id}>
                            {curso.nombre_materia} · {curso.division} ·{" "}
                            {curso.anio_lectivo}
                        </option>
                    ))}
                </select>

                {cursosDisponibles.length === 0 && (
                    <p className="texto-ayuda">
                        No hay cursos activos. Creá uno desde la sección
                        Cursos.
                    </p>
                )}

                <label htmlFor="invitacion-email">Email del alumno</label>
                <input
                    id="invitacion-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alumno@ejemplo.com"
                />

                <div className="acciones-formulario">
                    <button
                        type="submit"
                        disabled={
                            creando
                            || alumnosDisponibles.length === 0
                            || cursosDisponibles.length === 0
                        }
                    >
                        {creando ? "Creando..." : "Crear invitación"}
                    </button>
                </div>

                {(errorLocal || errorCrear) && (
                    <p className="mensaje-error" role="alert">
                        {errorLocal || errorCrear}
                    </p>
                )}
            </form>

            {creada && (
                <div className="invitacion-creada">
                    <h2>Invitación creada</h2>
                    <p>
                        Compartí este enlace con el alumno. Vence el{" "}
                        {formatearFechaHora(creada.expira_en)}.
                    </p>

                    <div className="enlace-invitacion">
                        <input
                            readOnly
                            value={enlace}
                            aria-label="Enlace de activación"
                            onFocus={(e) => e.target.select()}
                        />
                        <button type="button" onClick={copiarEnlace}>
                            {copiado ? "Copiado" : "Copiar enlace"}
                        </button>
                    </div>

                    {errorCopia && (
                        <p className="mensaje-error" role="alert">
                            {errorCopia}
                        </p>
                    )}
                </div>
            )}

            <h2>Invitaciones existentes</h2>

            {cargando && <p>Cargando invitaciones...</p>}

            {errorCarga && (
                <p className="mensaje-error" role="alert">
                    {errorCarga}
                </p>
            )}

            {errorRevocar && (
                <p className="mensaje-error" role="alert">
                    {errorRevocar}
                </p>
            )}

            {!cargando && !errorCarga && (
                <div className="tabla-contenedor">
                    <table className="tabla-alumnos">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Alumno</th>
                                <th>Curso</th>
                                <th>Email</th>
                                <th>Expira</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {invitaciones.length === 0 ? (
                                <tr>
                                    <td colSpan={7}>
                                        No hay invitaciones para mostrar.
                                    </td>
                                </tr>
                            ) : (
                                invitaciones.map((invitacion) => {
                                    const estado = obtenerEstado(
                                        invitacion,
                                        ahora
                                    )
                                    const alumno = alumnosPorId.get(
                                        invitacion.alumno_id
                                    )
                                    const curso = cursosPorId.get(
                                        invitacion.curso_id
                                    )

                                    return (
                                        <tr key={invitacion.id}>
                                            <td>{invitacion.id}</td>
                                            <td>
                                                {alumno
                                                    ? `${alumno.apellido}, ${alumno.nombre}`
                                                    : `Alumno #${invitacion.alumno_id}`}
                                            </td>
                                            <td>
                                                {curso
                                                    ? `${curso.nombre_materia} · ${curso.division}`
                                                    : `Curso #${invitacion.curso_id}`}
                                            </td>
                                            <td>{invitacion.email}</td>
                                            <td>
                                                {formatearFechaHora(
                                                    invitacion.expira_en
                                                )}
                                            </td>
                                            <td>
                                                <span
                                                    className={`invitacion-estado ${
                                                        estado.clase
                                                    }`}
                                                >
                                                    {estado.texto}
                                                </span>
                                            </td>
                                            <td>
                                                {estado.texto ===
                                                "Pendiente" ? (
                                                    <button
                                                        type="button"
                                                        className="btn-revocar"
                                                        disabled={
                                                            revocandoId
                                                            === invitacion.id
                                                        }
                                                        onClick={() =>
                                                            onRevocar(
                                                                invitacion.id
                                                            )
                                                        }
                                                    >
                                                        {revocandoId
                                                        === invitacion.id
                                                            ? "Revocando..."
                                                            : "Revocar"}
                                                    </button>
                                                ) : (
                                                    "—"
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    )
}

export default Invitaciones
