function FormularioAlumno ({
    modo,
    nombre,
    setNombre,
    apellido,
    setApellido,
    edad,
    setEdad,
    onGuardar,
    cargando,
    error,
    informarError,
    onCancelar
}) {
    return (
        <form onSubmit={(e) => {
            e.preventDefault()
            informarError("")

            if (nombre.trim() === "" || apellido.trim() === "") {
                informarError("El nombre y apellido no pueden estar vacíos")
                return
            }

            onGuardar()
        }}>
            <h2>
                {modo === "crear" ? "Crear alumno" : "Editar alumno"}
            </h2>

            <p>Nombre</p>
            <input
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
            />

            <p>Apellido</p>
            <input
                required
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
            />

            <p>Edad</p>
            <input
                type="number"
                value={edad}
                min={1}
                max={99}
                onChange={(e) => setEdad(e.target.value)}
            />
            <div className="acciones-formulario">
                <button disabled={cargando} type="submit">
                    {cargando 
                        ? "Guardando..." 
                        : modo === "crear"
                            ? "Agregar alumno"
                            : "Guardar cambios"}
                </button>
            
                {modo === "editar" && (
                    <button type="button" onClick={onCancelar}>
                        Cancelar
                    </button>
                )}
            </div>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </form> 
    )
}

export default FormularioAlumno