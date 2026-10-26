import { useEffect, useState } from "react"

import {
    mensajeErrorAcademico,
    obtenerMisCalificaciones,
    obtenerMisCursos,
    obtenerMisEvaluaciones
} from "../academicoService"

function useAcademicoAlumno(token, cerrarSesion, habilitado = true) {
    const [cursos, setCursos] = useState([])
    const [evaluaciones, setEvaluaciones] = useState([])
    const [calificaciones, setCalificaciones] = useState([])
    const [cargando, setCargando] = useState(false)
    const [errorCarga, setErrorCarga] = useState("")

    useEffect(() => {
        if (!token || !habilitado) {
            return
        }

        let cancelado = false

        async function cargarAcademico() {
            setCargando(true)
            setErrorCarga("")

            try {
                const [datosCursos, datosEvaluaciones, datosCalificaciones] =
                    await Promise.all([
                        obtenerMisCursos(token),
                        obtenerMisEvaluaciones(token),
                        obtenerMisCalificaciones(token)
                    ])

                if (!cancelado) {
                    setCursos(datosCursos)
                    setEvaluaciones(datosEvaluaciones)
                    setCalificaciones(datosCalificaciones)
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
                    mensajeErrorAcademico(
                        error,
                        "No se pudieron cargar tus datos académicos"
                    )
                )
            } finally {
                if (!cancelado) {
                    setCargando(false)
                }
            }
        }

        cargarAcademico()

        return () => {
            cancelado = true
        }
    }, [token, cerrarSesion, habilitado])

    return {
        cursos,
        evaluaciones,
        calificaciones,
        cargando,
        errorCarga
    }
}

export default useAcademicoAlumno
