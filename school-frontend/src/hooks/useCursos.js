import { useEffect, useState } from "react"

import {
    actualizarCurso as actualizarCursoApi,
    archivarCurso as archivarCursoApi,
    crearCurso as crearCursoApi,
    eliminarCurso as eliminarCursoApi,
    obtenerCursos,
    reactivarCurso as reactivarCursoApi
} from "../cursoService"

function useCursos(token, cerrarSesion, habilitado = true) {
    const [cursos, setCursos] = useState([])
    const [cargandoCursos, setCargandoCursos] = useState(false)
    const [errorCarga, setErrorCarga] = useState("")
    const [creando, setCreando] = useState(false)
    const [errorCrear, setErrorCrear] = useState("")
    const [actualizando, setActualizando] = useState(false)
    const [errorActualizar, setErrorActualizar] = useState("")
    const [procesandoId, setProcesandoId] = useState(null)
    const [errorAccion, setErrorAccion] = useState("")
    const [mensajeAccion, setMensajeAccion] = useState("")

    useEffect(() => {
        if (!token || !habilitado) {
            return
        }

        let cancelado = false

        async function cargarCursos() {
            setCargandoCursos(true)
            setErrorCarga("")

            try {
                const datos = await obtenerCursos(token)

                if (!cancelado) {
                    setCursos(datos)
                }
            } catch (error) {
                if (cancelado) {
                    return
                }

                if (error.status === 401) {
                    cerrarSesion(true)
                    return
                }

                setErrorCarga(
                    error.status
                        ? error.message || "No se pudieron cargar los cursos"
                        : "No se pudo conectar con el servidor"
                )
            } finally {
                if (!cancelado) {
                    setCargandoCursos(false)
                }
            }
        }

        cargarCursos()

        return () => {
            cancelado = true
        }
    }, [token, cerrarSesion, habilitado])

    async function crearCurso(datos) {
        setCreando(true)
        setErrorCrear("")

        try {
            const creado = await crearCursoApi(token, datos)

            setCursos((cursosActuales) => [
                ...cursosActuales,
                creado
            ])

            return creado
        } catch (error) {
            if (error.status === 401) {
                cerrarSesion(true)
                return null
            }

            setErrorCrear(
                error.status
                    ? error.message || "No se pudo crear el curso"
                    : "No se pudo conectar con el servidor"
            )

            return null
        } finally {
            setCreando(false)
        }
    }

    function limpiarAccion() {
        setErrorActualizar("")
        setErrorAccion("")
        setMensajeAccion("")
    }

    async function actualizarCurso(cursoId, datos) {
        setActualizando(true)
        setErrorActualizar("")
        setMensajeAccion("")

        try {
            const actualizado = await actualizarCursoApi(token, cursoId, datos)

            setCursos((cursosActuales) =>
                cursosActuales.map((curso) =>
                    curso.id === cursoId ? actualizado : curso
                )
            )

            setMensajeAccion("Curso actualizado.")
            return actualizado
        } catch (error) {
            if (error.status === 401) {
                cerrarSesion(true)
                return null
            }

            setErrorActualizar(
                error.status
                    ? error.message || "No se pudo actualizar el curso"
                    : "No se pudo conectar con el servidor"
            )

            return null
        } finally {
            setActualizando(false)
        }
    }

    async function cambiarEstadoCurso(cursoId, accion, mensaje) {
        setProcesandoId(cursoId)
        setErrorAccion("")
        setMensajeAccion("")

        try {
            const actualizado = await accion(token, cursoId)

            setCursos((cursosActuales) =>
                cursosActuales.map((curso) =>
                    curso.id === cursoId ? actualizado : curso
                )
            )

            setMensajeAccion(mensaje)
            return true
        } catch (error) {
            if (error.status === 401) {
                cerrarSesion(true)
                return false
            }

            setErrorAccion(
                error.status
                    ? error.message || "No se pudo actualizar el curso"
                    : "No se pudo conectar con el servidor"
            )

            return false
        } finally {
            setProcesandoId(null)
        }
    }

    async function archivarCurso(cursoId) {
        return cambiarEstadoCurso(
            cursoId,
            archivarCursoApi,
            "Curso archivado."
        )
    }

    async function reactivarCurso(cursoId) {
        return cambiarEstadoCurso(
            cursoId,
            reactivarCursoApi,
            "Curso reactivado."
        )
    }

    async function eliminarCurso(cursoId) {
        setProcesandoId(cursoId)
        setErrorAccion("")
        setMensajeAccion("")

        try {
            await eliminarCursoApi(token, cursoId)

            setCursos((cursosActuales) =>
                cursosActuales.filter((curso) => curso.id !== cursoId)
            )

            setMensajeAccion("Curso eliminado.")
            return true
        } catch (error) {
            if (error.status === 401) {
                cerrarSesion(true)
                return false
            }

            setErrorAccion(
                error.status
                    ? error.message || "No se pudo eliminar el curso"
                    : "No se pudo conectar con el servidor"
            )

            return false
        } finally {
            setProcesandoId(null)
        }
    }

    return {
        cursos,
        cargandoCursos,
        errorCarga,
        crearCurso,
        creando,
        errorCrear,
        actualizarCurso,
        actualizando,
        errorActualizar,
        archivarCurso,
        reactivarCurso,
        eliminarCurso,
        procesandoId,
        errorAccion,
        mensajeAccion,
        limpiarAccion
    }
}

export default useCursos
