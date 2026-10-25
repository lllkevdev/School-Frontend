function obtenerFechaMaxima() {
    const hoy = new Date()
    const anio = hoy.getFullYear()
    const mes = String(hoy.getMonth() + 1).padStart(2, "0")
    const dia = String(hoy.getDate()).padStart(2, "0")

    return `${anio}-${mes}-${dia}`
}

function FormularioAlumno ({
    nombre,
    setNombre,
    apellido,
    setApellido,
    documentoIdentidad,
    setDocumentoIdentidad,
    fechaNacimiento,
    setFechaNacimiento,
    onGuardar,
    cargando,
    error,
    informarError
}) {
    return (
        <form
            className="formulario-alumno formulario-crear"

            onSubmit={(e) => {
                e.preventDefault()
                informarError("")

                if (nombre.trim() === "" || apellido.trim() === "") {
                    informarError("El nombre y apellido no pueden estar vacíos")
                    return
                }

                if (documentoIdentidad.trim().length < 5) {
                    informarError("El documento debe tener al menos 5 caracteres")
                    return
                }

                if (fechaNacimiento === "") {
                    informarError("La fecha de nacimiento es obligatoria")
                    return
                }

                if (fechaNacimiento > obtenerFechaMaxima()) {
                    informarError("La fecha de nacimiento no puede ser futura")
                    return
                }

                onGuardar()
        }   }>
            <h2>Crear alumno</h2>

            <p>Nombre</p>
            <input
                required
                minLength={2}
                maxLength={100}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
            />

            <p>Apellido</p>
            <input
                required
                minLength={2}
                maxLength={100}
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
            />

            <p>Documento de identidad</p>
            <input
                required
                minLength={5}
                maxLength={20}
                value={documentoIdentidad}
                onChange={(e) => setDocumentoIdentidad(e.target.value)}
            />

            <p>Fecha de nacimiento</p>
            <input
                required
                type="date"
                max={obtenerFechaMaxima()}
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
            />
            <div className="acciones-formulario">
                <button disabled={cargando} type="submit">
                    {cargando
                        ? "Guardando..."
                        : "Agregar alumno"}
                </button>
            </div>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
    )
}

export default FormularioAlumno
