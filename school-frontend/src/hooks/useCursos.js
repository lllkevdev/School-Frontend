import { useEffect, useState } from "react"

import {
    crearCurso as crearCursoApi,
    obtenerCursos
} from "../cursoService"

function useCursos(token, cerrarSesion, habilitado = true) {
    const [cursos, setCursos] = useState([])
    const [cargandoCursos, setCargandoCursos] = useState(false)
    const [errorCarga, setErrorCarga] = useState("")
    const [creando, setCreando] = useState(false)
    const [errorCrear, setErrorCrear] = useState("")

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

    return {
        cursos,
        cargandoCursos,
        errorCarga,
        crearCurso,
        creando,
        errorCrear
    }
}

export default useCursos
