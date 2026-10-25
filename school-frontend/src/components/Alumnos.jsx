import Alumno from "./Alumno"

function formatearFecha(fecha) {
    if (!fecha) {
        return "-"
    }

    const [anio, mes, dia] = fecha.split("-")

    return `${dia}/${mes}/${anio}`
}

function Alumnos({
    alumnos,
    onPrepararDesactivacion,
    idConfirmacion,
    errorDesactivacion,
    cargandoDesactivacion,
    onConfirmarDesactivacion,
    onCancelarDesactivacion,
    subseccionAlumnos,
    onCambiarSubseccion,
    }) {
    return (
        <section className="alumnos-seccion">
            <nav className="subsecciones-alumnos">
                <button
                    className={subseccionAlumnos === "listado" ? "activo" : ""}
                    onClick={() => onCambiarSubseccion("listado")}
                >
                    Listado
                </button>

                <button
                    className={subseccionAlumnos === "crear" ? "activo" : ""}
                    onClick={() => onCambiarSubseccion("crear")}
                >
                    Agregar alumno
                </button>
            </nav>

        {subseccionAlumnos === "listado" && (
            <>
                <h2>Alumnos existentes</h2>

                <div className="tabla-contenedor">
                    <table className="tabla-alumnos">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Apellido</th>
                                <th>Documento</th>
                                <th>Nacimiento</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {alumnos.length === 0 ? (
                                <tr>
                                    <td colSpan={7}>
                                        No hay alumnos para mostrar.
                                    </td>
                                </tr>
                            ) : (
                                alumnos.map((alumno) => (
                                    <tr key={alumno.id}>
                                    <td>{alumno.id}</td>
                                    <td>{alumno.nombre}</td>
                                    <td>{alumno.apellido}</td>
                                    <td>{alumno.documento_identidad}</td>
                                    <td>{formatearFecha(alumno.fecha_nacimiento)}</td>
                                    <td>
                                        <span
                                            className={
                                                alumno.activo
                                                    ? "alumno-estado activo"
                                                    : "alumno-estado inactivo"
                                            }
                                        >
                                            {alumno.activo ? "Activo" : "Inactivo"}
                                        </span>
                                    </td>
                                    <td className="acciones-alumno">
                                        <Alumno
                                            activo={alumno.activo}
                                            onDesactivar={() =>
                                                onPrepararDesactivacion(alumno.id)
                                            }
                                        />
                                    </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            {idConfirmacion !== null && (
                <div className="confirmacion-eliminacion">
                    <p>¿Seguro que querés desactivar este alumno?</p>

                    {errorDesactivacion && (
                        <p role="alert" className="mensaje-error">
                            {errorDesactivacion}
                        </p>
                    )}

                    <button
                        disabled={cargandoDesactivacion}
                        onClick={() => onConfirmarDesactivacion(idConfirmacion)}
                    >
                        {cargandoDesactivacion
                            ? "Desactivando..."
                            : "Confirmar"}
                    </button>

                    <button
                        onClick={onCancelarDesactivacion}
                        disabled={cargandoDesactivacion}
                    >
                        Cancelar
                    </button>
                </div>
            )}
            </>
        )}
        </section>
    )
    }

export default Alumnos
