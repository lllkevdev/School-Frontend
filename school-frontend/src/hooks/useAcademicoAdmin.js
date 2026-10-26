import { useEffect, useState } from "react"

import {
    actualizarCalificacion as actualizarCalificacionApi,
    actualizarEvaluacion as actualizarEvaluacionApi,
    altaAlumnoConInscripcion as altaAlumnoConInscripcionApi,
    crearCalificacion as crearCalificacionApi,
    crearEvaluacion as crearEvaluacionApi,
    crearInscripcion,
    eliminarCalificacion as eliminarCalificacionApi,
    eliminarEvaluacion as eliminarEvaluacionApi,
    eliminarInscripcion,
    exportarCalificaciones,
    importarAlumnos as importarAlumnosApi,
    mensajeErrorAcademico,
    obtenerCalificacionesCurso,
    obtenerEvaluacionesCurso,
    obtenerInscripcionesCurso
} from "../academicoService"

const ESTADO_INICIAL = {
    cursoId: 0,
    cargando: false,
    error: "",
    evaluaciones: [],
    calificaciones: [],
    inscripciones: []
}

function ordenarEvaluaciones(evaluaciones) {
    return [...evaluaciones].sort((a, b) => {
        const fecha = a.fecha.localeCompare(b.fecha)

        if (fecha !== 0) {
            return fecha
        }

        return a.id - b.id
    })
}

function useAcademicoAdmin(
    token,
    cerrarSesion,
    cursos,
    onAlumnoRegistrado,
    habilitado = true
) {
    const [cursoIdSeleccionado, setCursoIdSeleccionado] = useState(0)
    const [estadoCurso, setEstadoCurso] = useState(ESTADO_INICIAL)
    const [procesando, setProcesando] = useState(false)
    const [errorOperacion, setErrorOperacion] = useState("")
    const [mensajeOperacion, setMensajeOperacion] = useState("")
    const [exportando, setExportando] = useState(false)
    const [errorExportar, setErrorExportar] = useState("")
    const [importando, setImportando] = useState(false)

    const cursoPredeterminado = cursos.find((curso) => curso.activo)
        || cursos[0]
    const cursoId = cursos.some(
        (curso) => curso.id === cursoIdSeleccionado
    )
        ? cursoIdSeleccionado
        : cursoPredeterminado?.id || 0
    const cursoSeleccionado = cursos.find(
        (curso) => curso.id === cursoId
    ) || null
    const datosActuales = estadoCurso.cursoId === cursoId
        ? estadoCurso
        : null
    const evaluaciones = datosActuales?.evaluaciones || []
    const calificaciones = datosActuales?.calificaciones || []
    const inscripciones = datosActuales?.inscripciones || []
    const cargando = Boolean(token && habilitado && cursoId)
        && (!datosActuales || datosActuales.cargando)
    const errorCarga = datosActuales?.error || ""

    useEffect(() => {
        if (!token || !habilitado || !cursoId) {
            return
        }

        let cancelado = false

        async function cargarCurso() {
            setEstadoCurso({
                ...ESTADO_INICIAL,
                cursoId,
                cargando: true
            })

            try {
                const [
                    datosEvaluaciones,
                    datosCalificaciones,
                    datosInscripciones
                ] = await Promise.all([
                    obtenerEvaluacionesCurso(token, cursoId),
                    obtenerCalificacionesCurso(token, cursoId),
                    obtenerInscripcionesCurso(token, cursoId)
                ])

                if (!cancelado) {
                    setEstadoCurso({
                        cursoId,
                        cargando: false,
                        error: "",
                        evaluaciones: ordenarEvaluaciones(datosEvaluaciones),
                        calificaciones: datosCalificaciones,
                        inscripciones: datosInscripciones
                    })
                }
            } catch (error) {
                if (cancelado) {
                    return
                }

                if (error.status === 401) {
                    cerrarSesion(true)
                    return
                }

                setEstadoCurso({
                    ...ESTADO_INICIAL,
                    cursoId,
                    error: mensajeErrorAcademico(
                        error,
                        "No se pudieron cargar los datos del curso"
                    )
                })
            }
        }

        cargarCurso()

        return () => {
            cancelado = true
        }
    }, [token, cerrarSesion, habilitado, cursoId])

    function seleccionarCurso(id) {
        setCursoIdSeleccionado(Number(id))
        setErrorOperacion("")
        setMensajeOperacion("")
        setErrorExportar("")
    }

    function limpiarMensajes() {
        setErrorOperacion("")
        setMensajeOperacion("")
        setErrorExportar("")
    }

    function manejarError(error, mensajePorDefecto) {
        if (error.status === 401) {
            cerrarSesion(true)
            return
        }

        setErrorOperacion(mensajeErrorAcademico(error, mensajePorDefecto))
    }

    function actualizarDatosCurso(actualizador) {
        setEstadoCurso((actual) => {
            if (actual.cursoId !== cursoId) {
                return actual
            }

            return actualizador(actual)
        })
    }

    async function crearEvaluacion(datos) {
        setProcesando(true)
        limpiarMensajes()

        try {
            const creada = await crearEvaluacionApi(token, datos)
            actualizarDatosCurso((actual) => ({
                ...actual,
                evaluaciones: ordenarEvaluaciones([
                    ...actual.evaluaciones,
                    creada
                ])
            }))
            setMensajeOperacion("Evaluación creada correctamente")
            return creada
        } catch (error) {
            manejarError(error, "No se pudo crear la evaluación")
            return null
        } finally {
            setProcesando(false)
        }
    }

    async function actualizarEvaluacion(id, datos) {
        setProcesando(true)
        limpiarMensajes()

        try {
            const actualizada = await actualizarEvaluacionApi(token, id, datos)
            actualizarDatosCurso((actual) => ({
                ...actual,
                evaluaciones: ordenarEvaluaciones(
                    actual.evaluaciones.map((evaluacion) =>
                        evaluacion.id === id ? actualizada : evaluacion
                    )
                )
            }))
            setMensajeOperacion("Evaluación actualizada correctamente")
            return actualizada
        } catch (error) {
            manejarError(error, "No se pudo actualizar la evaluación")
            return null
        } finally {
            setProcesando(false)
        }
    }

    async function eliminarEvaluacion(id) {
        setProcesando(true)
        limpiarMensajes()

        try {
            await eliminarEvaluacionApi(token, id)
            actualizarDatosCurso((actual) => ({
                ...actual,
                evaluaciones: actual.evaluaciones.filter(
                    (evaluacion) => evaluacion.id !== id
                ),
                calificaciones: actual.calificaciones.filter(
                    (calificacion) => calificacion.evaluacion_id !== id
                )
            }))
            setMensajeOperacion("Evaluación eliminada correctamente")
            return true
        } catch (error) {
            manejarError(error, "No se pudo eliminar la evaluación")
            return false
        } finally {
            setProcesando(false)
        }
    }

    async function crearCalificacion(datos) {
        setProcesando(true)
        limpiarMensajes()

        try {
            const creada = await crearCalificacionApi(token, datos)
            actualizarDatosCurso((actual) => ({
                ...actual,
                calificaciones: [...actual.calificaciones, creada]
            }))
            setMensajeOperacion("Calificación registrada correctamente")
            return creada
        } catch (error) {
            manejarError(error, "No se pudo registrar la calificación")
            return null
        } finally {
            setProcesando(false)
        }
    }

    async function actualizarCalificacion(id, nota) {
        setProcesando(true)
        limpiarMensajes()

        try {
            const actualizada = await actualizarCalificacionApi(token, id, nota)
            actualizarDatosCurso((actual) => ({
                ...actual,
                calificaciones: actual.calificaciones.map((calificacion) =>
                    calificacion.id === id ? actualizada : calificacion
                )
            }))
            setMensajeOperacion("Calificación actualizada correctamente")
            return actualizada
        } catch (error) {
            manejarError(error, "No se pudo actualizar la calificación")
            return null
        } finally {
            setProcesando(false)
        }
    }

    async function eliminarCalificacion(id) {
        setProcesando(true)
        limpiarMensajes()

        try {
            await eliminarCalificacionApi(token, id)
            actualizarDatosCurso((actual) => ({
                ...actual,
                calificaciones: actual.calificaciones.filter(
                    (calificacion) => calificacion.id !== id
                )
            }))
            setMensajeOperacion("Calificación eliminada correctamente")
            return true
        } catch (error) {
            manejarError(error, "No se pudo eliminar la calificación")
            return false
        } finally {
            setProcesando(false)
        }
    }

    async function inscribirAlumno(alumnoId) {
        setProcesando(true)
        limpiarMensajes()

        try {
            const inscripcion = await crearInscripcion(
                token,
                alumnoId,
                cursoId
            )
            actualizarDatosCurso((actual) => ({
                ...actual,
                inscripciones: [...actual.inscripciones, inscripcion]
            }))
            setMensajeOperacion("Alumno inscripto correctamente")
            return inscripcion
        } catch (error) {
            manejarError(error, "No se pudo inscribir al alumno")
            return null
        } finally {
            setProcesando(false)
        }
    }

    async function registrarAlumnoConInscripcion(
        datos,
        confirmarExistente = false
    ) {
        setProcesando(true)
        limpiarMensajes()

        try {
            const resultado = await altaAlumnoConInscripcionApi(token, {
                ...datos,
                curso_id: cursoId,
                confirmar_existente: confirmarExistente
            })

            if (resultado.requiere_confirmacion) {
                return resultado
            }

            actualizarDatosCurso((actual) => ({
                ...actual,
                inscripciones: [
                    ...actual.inscripciones,
                    resultado.inscripcion
                ]
            }))
            onAlumnoRegistrado?.(resultado.alumno)
            setMensajeOperacion(
                confirmarExistente
                    ? "Alumno existente inscripto correctamente"
                    : "Alumno registrado e inscripto correctamente"
            )
            return resultado
        } catch (error) {
            manejarError(
                error,
                confirmarExistente
                    ? "No se pudo inscribir al alumno existente"
                    : "No se pudo registrar e inscribir al alumno"
            )
            return null
        } finally {
            setProcesando(false)
        }
    }

    async function quitarInscripcion(inscripcionId) {
        setProcesando(true)
        limpiarMensajes()

        try {
            await eliminarInscripcion(token, inscripcionId)
            actualizarDatosCurso((actual) => ({
                ...actual,
                inscripciones: actual.inscripciones.filter(
                    (inscripcion) => inscripcion.id !== inscripcionId
                )
            }))
            setMensajeOperacion("Inscripción eliminada correctamente")
            return true
        } catch (error) {
            manejarError(error, "No se pudo quitar la inscripción")
            return false
        } finally {
            setProcesando(false)
        }
    }

    async function importarAlumnos(archivo) {
        if (!cursoId) {
            return null
        }

        setImportando(true)
        limpiarMensajes()

        try {
            const resultado = await importarAlumnosApi(
                token,
                cursoId,
                archivo
            )

            actualizarDatosCurso((actual) => {
                const existentes = new Set(
                    actual.inscripciones.map(
                        (inscripcion) => inscripcion.id
                    )
                )
                const nuevas = resultado.inscripciones.filter(
                    (inscripcion) => !existentes.has(inscripcion.id)
                )

                return {
                    ...actual,
                    inscripciones: [...actual.inscripciones, ...nuevas]
                }
            })

            resultado.alumnos.forEach((alumno) => {
                onAlumnoRegistrado?.(alumno)
            })

            return resultado
        } catch (error) {
            manejarError(error, "No se pudieron importar los alumnos")
            return null
        } finally {
            setImportando(false)
        }
    }

    async function descargarCalificaciones() {
        if (!cursoId) {
            return
        }

        setExportando(true)
        setErrorExportar("")

        try {
            const { blob, nombre } = await exportarCalificaciones(
                token,
                cursoId
            )
            const url = URL.createObjectURL(blob)
            const enlace = document.createElement("a")
            enlace.href = url
            enlace.download = nombre
            document.body.appendChild(enlace)
            enlace.click()
            enlace.remove()
            URL.revokeObjectURL(url)
        } catch (error) {
            if (error.status === 401) {
                cerrarSesion(true)
                return
            }

            setErrorExportar(
                mensajeErrorAcademico(
                    error,
                    "No se pudieron exportar las calificaciones"
                )
            )
        } finally {
            setExportando(false)
        }
    }

    return {
        cursoId,
        cursoSeleccionado,
        seleccionarCurso,
        evaluaciones,
        calificaciones,
        inscripciones,
        cargando,
        errorCarga,
        procesando,
        errorOperacion,
        mensajeOperacion,
        limpiarMensajes,
        crearEvaluacion,
        actualizarEvaluacion,
        eliminarEvaluacion,
        crearCalificacion,
        actualizarCalificacion,
        eliminarCalificacion,
        inscribirAlumno,
        registrarAlumnoConInscripcion,
        quitarInscripcion,
        importarAlumnos,
        importando,
        descargarCalificaciones,
        exportando,
        errorExportar
    }
}

export default useAcademicoAdmin
