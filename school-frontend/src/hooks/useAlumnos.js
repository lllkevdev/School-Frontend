
import { useState, useEffect } from "react"
import { 
    obtenerAlumnos,
    crearAlumno,
    actualizarAlumno,
    eliminarAlumno as eliminarAlumnoApi
} from "../alumnoService"

function useAlumnos(token, cerrarSesion) {
    const [alumnos, setAlumnos] = useState([])
    const [errorCarga, setErrorCarga] = useState("")
    const [cargandoAlumnos, setCargandoAlumnos] = useState(false)
    const [cargando, setCargando] = useState(false)
    const [error, setError] = useState("")
    const [cargandoEdicion, setCargandoEdicion] = useState(false)
    const [errorEdicion, setErrorEdicion] = useState("")
    const [cargandoEliminacion, setCargandoEliminacion] = useState(false)
    const [errorEliminacion, setErrorEliminacion] = useState("")

    function informarError(mensaje) {
        setError(mensaje)
    }

    useEffect(() => {
        if (!token) {
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
    }, [token, cerrarSesion])


    async function agregarAlumno(nombre, apellido, edad) {
        setCargando(true)
        setError("")

    try {
        const datos = await crearAlumno(token, {
            nombre: nombre,
            apellido: apellido,
            edad: Number(edad)
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

    async function guardarEdicion(id, nombre, apellido, edad) {
        setCargandoEdicion(true)
        setErrorEdicion("")

        try {
            const datos = await actualizarAlumno(token, id, {
                nombre: nombre,
                apellido: apellido,
                edad: Number(edad)
            })

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
                setErrorEdicion(error.message || "No se pudo actualizar el alumno")
                console.log("Error al actualizar el alumno:", error.status)
                return false
            }

            setErrorEdicion("No se pudo conectar con el servidor")
            return false

        } finally {
            setCargandoEdicion(false)
        }
        }

    async function eliminarAlumno(id) {
        setCargandoEliminacion(true)
        setErrorEliminacion("")

    try {
        await eliminarAlumnoApi(token, id)

        setAlumnos((alumnosActuales) =>
            alumnosActuales.filter((alumno) => alumno.id !== id)
        )

        return true
    } catch (error) {
        if (error.status === 401) {
            cerrarSesion(true)
            return false
        }

        if (error.status) {
            setErrorEliminacion(error.message || "No se pudo eliminar el alumno")
            console.log("Error al eliminar el alumno:", error.status)
            return false
        }

        setErrorEliminacion("No se pudo conectar con el servidor")
        return false
    } finally {
        setCargandoEliminacion(false)
    }
    }

    return {
        alumnos,
        errorCarga,
        cargandoAlumnos,
        agregarAlumno,
        cargando,
        error,
        guardarEdicion,
        cargandoEdicion,
        errorEdicion,
        eliminarAlumno,
        cargandoEliminacion,
        errorEliminacion,
        informarError
    }
}
export default useAlumnos