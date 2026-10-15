
import Alumno from "./alumno"

function Alumnos({
    alumnos,
    onPrepararEliminacion,
    onPrepararEdicion,
    idConfirmacion,
    errorEliminacion,
    cargandoEliminacion,
    onEliminar,
    onCancelarEliminacion,
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
                                <th>Edad</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {alumnos.map((alumno) => (
                                <tr key={alumno.id}>
                                <td>{alumno.id}</td>
                                <td>{alumno.nombre}</td>
                                <td>{alumno.apellido}</td>
                                <td>{alumno.edad}</td>
                                <td className="acciones-alumno">
                                    <Alumno
                                        onEliminar={() =>
                                            onPrepararEliminacion(alumno.id)
                                        }   
                                        onEditar={() =>
                                            onPrepararEdicion(alumno.id)
                                        }
                                    />
                                </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            {idConfirmacion !== null && (
                <div className="confirmacion-eliminacion">
                    <p>¿Seguro que querés eliminar este alumno?</p>

                    {errorEliminacion && (
                        <p role="alert" className="mensaje-error">
                            {errorEliminacion}
                        </p>
                    )}

                    <button
                        disabled={cargandoEliminacion}
                        onClick={() => onEliminar(idConfirmacion)}
                    >
                        {cargandoEliminacion
                            ? "Eliminando..."
                            : "Confirmar"}
                    </button>

                    <button
                        onClick={onCancelarEliminacion}
                        disabled={cargandoEliminacion}
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