import { useState, useEffect } from "react"
import {
    obtenerAlumnos,
    crearAlumno,
    desactivarAlumno as desactivarAlumnoApi
} from "../alumnoService"

function useAlumnos(token, cerrarSesion, habilitado = true) {
    const [alumnos, setAlumnos] = useState([])
    const [errorCarga, setErrorCarga] = useState("")
    const [cargandoAlumnos, setCargandoAlumnos] = useState(false)
    const [cargando, setCargando] = useState(false)
    const [error, setError] = useState("")
    const [cargandoDesactivacion, setCargandoDesactivacion] = useState(false)
    const [errorDesactivacion, setErrorDesactivacion] = useState("")

    function informarError(mensaje) {
        setError(mensaje)
    }

    useEffect(() => {
        if (!token || !habilitado) {
            return
        }

        async function cargarAlumnos() {
            setErrorCarga("")
            setCargandoAlumnos(true)

            try {
                const datos = await obtenerAlumnos(token)
                setAlumnos(datos)

            } catch (error) {
                if (error.status === 401) {
                    cerrarSesion(true)
                    return
                }

                if (error.status === 403) {
                    setErrorCarga("No tenés permisos para consultar los alumnos")
                    return
                }

                if (error.status) {
                    setErrorCarga(error.message || "No se pudieron cargar los alumnos")
                    console.log("Error al cargar los alumnos", error.status)
                    return
                }

                setErrorCarga("No se pudo conectar con el servidor")

            } finally {
                setCargandoAlumnos(false)
            }
        }

        cargarAlumnos()
    }, [token, cerrarSesion, habilitado])


    async function agregarAlumno(nombre, apellido, documentoIdentidad, fechaNacimiento) {
        setCargando(true)
        setError("")

        try {
            const datos = await crearAlumno(token, {
                nombre: nombre,
                apellido: apellido,
                documento_identidad: documentoIdentidad,
                fecha_nacimiento: fechaNacimiento
            })

            setAlumnos((alumnosActuales) => [
                ...alumnosActuales,
                datos
            ])
            return true

        } catch (error) {
            if (error.status === 401) {
                cerrarSesion(true)
                return false
            }

            if (error.status) {
                setError(error.message || "No se pudo crear el alumno")
                console.log("Error al crear alumno", error.status)
                return false
            }

            setError("No se pudo conectar con el servidor")
            return false

        } finally {
            setCargando(false)
        }
    }

    async function desactivarAlumno(id) {
        setCargandoDesactivacion(true)
        setErrorDesactivacion("")

        try {
            const datos = await desactivarAlumnoApi(token, id)

            setAlumnos((alumnosActuales) =>
                alumnosActuales.map((alumno) =>
                    alumno.id === id ? datos : alumno
                )
            )

            return true
        } catch (error) {
            if (error.status === 401) {
                cerrarSesion(true)
                return false
            }

            if (error.status) {
                setErrorDesactivacion(error.message || "No se pudo desactivar el alumno")
                console.log("Error al desactivar el alumno:", error.status)
                return false
            }

            setErrorDesactivacion("No se pudo conectar con el servidor")
            return false
        } finally {
            setCargandoDesactivacion(false)
        }
    }

    return {
        alumnos,
        errorCarga,
        cargandoAlumnos,
        agregarAlumno,
        cargando,
        error,
        desactivarAlumno,
        cargandoDesactivacion,
        errorDesactivacion,
        informarError
    }
}
export default useAlumnos
