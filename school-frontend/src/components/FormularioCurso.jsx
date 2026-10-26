import { useState } from "react"

function FormularioCurso({
    curso = null,
    onGuardar,
    guardando = false,
    error = "",
    onCancelar = null
}) {
    const anioActual = new Date().getFullYear()
    const esEdicion = curso !== null

    const [nombreMateria, setNombreMateria] = useState(
        curso?.nombre_materia ?? ""
    )
    const [division, setDivision] = useState(curso?.division ?? "")
    const [anioLectivo, setAnioLectivo] = useState(
        curso?.anio_lectivo ?? anioActual
    )
    const [cantidadPeriodos, setCantidadPeriodos] = useState(
        curso?.cantidad_periodos ?? 3
    )
    const [errorLocal, setErrorLocal] = useState("")

    async function guardar(evento) {
        evento.preventDefault()
        setErrorLocal("")

        if (nombreMateria.trim().length < 2) {
            setErrorLocal("El nombre de la materia es obligatorio")
            return
        }

        if (division.trim() === "") {
            setErrorLocal("La división es obligatoria")
            return
        }

        const anio = Number(anioLectivo)
        const periodos = Number(cantidadPeriodos)

        if (!Number.isInteger(anio) || anio < 2000 || anio > 2100) {
            setErrorLocal("El año lectivo debe estar entre 2000 y 2100")
            return
        }

        if (!Number.isInteger(periodos) || periodos < 1 || periodos > 12) {
            setErrorLocal("La cantidad de períodos debe estar entre 1 y 12")
            return
        }

        const guardado = await onGuardar({
            nombre_materia: nombreMateria.trim(),
            division: division.trim(),
            anio_lectivo: anio,
            cantidad_periodos: periodos
        })

        if (guardado && !esEdicion) {
            setNombreMateria("")
            setDivision("")
            setAnioLectivo(anioActual)
            setCantidadPeriodos(3)
        }
    }

    return (
        <form className="formulario-curso" onSubmit={guardar}>
            <h2>{esEdicion ? "Editar curso" : "Crear curso"}</h2>

            <p>Materia</p>
            <input
                required
                minLength={2}
                maxLength={100}
                value={nombreMateria}
                onChange={(e) => setNombreMateria(e.target.value)}
                placeholder="Ej. Matemática"
            />

            <p>División</p>
            <input
                required
                minLength={1}
                maxLength={30}
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                placeholder="Ej. A"
            />

            <p>Año lectivo</p>
            <input
                required
                type="number"
                min={2000}
                max={2100}
                value={anioLectivo}
                onChange={(e) => setAnioLectivo(e.target.value)}
            />

            <p>Cantidad de períodos</p>
            <input
                required
                type="number"
                min={1}
                max={12}
                value={cantidadPeriodos}
                onChange={(e) => setCantidadPeriodos(e.target.value)}
            />

            <div className="acciones-formulario">
                <button type="submit" disabled={guardando}>
                    {guardando
                        ? "Guardando..."
                        : esEdicion
                            ? "Guardar cambios"
                            : "Crear curso"}
                </button>

                {onCancelar && (
                    <button
                        type="button"
                        className="academico-secundario"
                        onClick={onCancelar}
                        disabled={guardando}
                    >
                        Cancelar
                    </button>
                )}
            </div>

            {(errorLocal || error) && (
                <p className="mensaje-error" role="alert">
                    {errorLocal || error}
                </p>
            )}
        </form>
    )
}

export default FormularioCurso
