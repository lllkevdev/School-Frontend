import { useEffect } from "react"
import FormularioAlumno from "./FormularioAlumno"


function ModalEdicionAlumno({
    nombre,
    setNombre,
    apellido,
    setApellido,
    edad,
    setEdad,
    informarError,
    onGuardar,
    cargando,
    error,
    onCerrar,
}) {

    useEffect(() => {
        function manejarTecla(evento) {
            if (evento.key === "Escape") {
                onCerrar()
            }
        }

        document.addEventListener("keydown", manejarTecla)

        return () => {
            document.removeEventListener("keydown", manejarTecla)
        }
    }, [onCerrar])

    return (
        <div className="modal-overlay">
            <div
                className="modal-contenido"
                role="dialog"
                aria-modal="true"
                aria-labelledby="titulo-modal-edicion"
            >
                <header className="modal-cabecera">
                    <h2 id="titulo-modal-edicion">
                        Modificar alumno
                    </h2>

                    <button
                        id="boton-cerrar"
                        type="button"
                        onClick={onCerrar}
                        aria-label="Cerrar ventana"
                    >
                        x
                    </button>
                </header>

                <FormularioAlumno
                    modo="editar"
                    nombre={nombre}
                    setNombre={setNombre}
                    apellido={apellido}
                    setApellido={setApellido}
                    edad={edad}
                    setEdad={setEdad}
                    informarError={informarError}
                    onGuardar={onGuardar}
                    onCancelar={onCerrar}
                    cargando={cargando}
                    error={error}
                />
            </div>
        </div>
    )
}

export default ModalEdicionAlumno