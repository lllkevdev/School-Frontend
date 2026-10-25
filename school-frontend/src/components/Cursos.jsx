import FormularioCurso from "./FormularioCurso"

function Cursos({
    cursos,
    cargando,
    errorCarga,
    onCrear,
    creando,
    errorCrear
}) {
    return (
        <section className="cursos-seccion">
            <FormularioCurso
                onCrear={onCrear}
                creando={creando}
                error={errorCrear}
            />

            <h2>Cursos existentes</h2>

            {cargando && <p>Cargando cursos...</p>}

            {errorCarga && (
                <p className="mensaje-error" role="alert">
                    {errorCarga}
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
                            </tr>
                        </thead>

                        <tbody>
                            {cursos.length === 0 ? (
                                <tr>
                                    <td colSpan={6}>
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
                                                    : "Inactivo"}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    )
}

export default Cursos
