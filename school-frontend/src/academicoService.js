import { API_URL, procesarRespuesta } from "./apiClient"

const MENSAJES_ERROR = {
    alumno_inactivo: "El alumno está desactivado y no se puede inscribir",
    alumno_inexistente: "El alumno no existe",
    alumno_no_inscripto: "El alumno no está inscripto en el curso",
    calificacion_duplicada: "El alumno ya tiene una nota en esa evaluación",
    calificacion_inexistente: "La calificación no existe",
    curso_inactivo: "El curso está inactivo",
    curso_inexistente: "El curso no existe",
    documento_duplicado: "Ya existe un alumno con ese documento",
    evaluacion_inexistente: "La evaluación no existe",
    inscripcion_con_calificaciones:
        "No se puede quitar la inscripción porque tiene calificaciones",
    inscripcion_duplicada: "El alumno ya está inscripto en el curso",
    inscripcion_inexistente: "La inscripción no existe",
    periodo_invalido: "El período no es válido para este curso",
    permiso: "No tenés permisos para realizar esta acción",
    sin_cambios: "No hay cambios para guardar",
    tiene_calificaciones:
        "No se puede eliminar la evaluación porque tiene calificaciones",
    tiene_evaluaciones:
        "No se puede eliminar el curso porque tiene evaluaciones",
    tiene_inscripciones:
        "No se puede eliminar el curso porque tiene inscripciones",
}

export function mensajeErrorAcademico(
    error,
    mensajePorDefecto = "No se pudo completar la operación"
) {
    if (!error) {
        return mensajePorDefecto
    }

    if (!error.status) {
        return "No se pudo conectar con el servidor"
    }

    return MENSAJES_ERROR[error.message]
        || error.message
        || mensajePorDefecto
}

async function solicitar(token, ruta, opciones = {}) {
    const respuesta = await fetch(`${API_URL}${ruta}`, {
        ...opciones,
        headers: {
            Authorization: `Bearer ${token}`,
            ...opciones.headers
        }
    })

    return await procesarRespuesta(respuesta)
}

export async function obtenerMisCursos(token) {
    return await solicitar(token, "/cursos/mis-cursos")
}

export async function obtenerMisEvaluaciones(token) {
    return await solicitar(token, "/evaluaciones/mis-evaluaciones")
}

export async function obtenerMisCalificaciones(token) {
    return await solicitar(token, "/calificaciones/mis-calificaciones")
}

export async function obtenerEvaluacionesCurso(token, cursoId) {
    return await solicitar(token, `/evaluaciones/curso/${cursoId}`)
}

export async function crearEvaluacion(token, datos) {
    return await solicitar(token, "/evaluaciones/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(datos)
    })
}

export async function actualizarEvaluacion(token, evaluacionId, datos) {
    return await solicitar(token, `/evaluaciones/${evaluacionId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(datos)
    })
}

export async function eliminarEvaluacion(token, evaluacionId) {
    return await solicitar(token, `/evaluaciones/${evaluacionId}`, {
        method: "DELETE"
    })
}

export async function obtenerCalificacionesCurso(token, cursoId) {
    return await solicitar(token, `/calificaciones/curso/${cursoId}`)
}

export async function crearCalificacion(token, datos) {
    return await solicitar(token, "/calificaciones/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(datos)
    })
}

export async function actualizarCalificacion(token, calificacionId, nota) {
    return await solicitar(token, `/calificaciones/${calificacionId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ nota })
    })
}

export async function eliminarCalificacion(token, calificacionId) {
    return await solicitar(token, `/calificaciones/${calificacionId}`, {
        method: "DELETE"
    })
}

export async function obtenerInscripcionesCurso(token, cursoId) {
    return await solicitar(token, `/inscripciones/curso/${cursoId}`)
}

export async function crearInscripcion(token, alumnoId, cursoId) {
    return await solicitar(token, "/inscripciones/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            alumno_id: alumnoId,
            curso_id: cursoId
        })
    })
}

export async function altaAlumnoConInscripcion(token, datos) {
    return await solicitar(token, "/alumnos/con-inscripcion", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(datos)
    })
}

export async function eliminarInscripcion(token, inscripcionId) {
    return await solicitar(token, `/inscripciones/${inscripcionId}`, {
        method: "DELETE"
    })
}

export async function importarAlumnos(token, cursoId, archivo) {
    const formulario = new FormData()
    formulario.append("curso_id", cursoId)
    formulario.append("archivo", archivo)

    const respuesta = await fetch(`${API_URL}/alumnos/importar`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: formulario
    })

    return await procesarRespuesta(respuesta)
}

async function crearErrorRespuesta(respuesta) {
    let detalle

    try {
        const datos = await respuesta.json()
        detalle = datos?.detail
    } catch {
        detalle = null
    }

    const mensaje = Array.isArray(detalle)
        ? detalle.map((error) => error.msg).join(" - ")
        : detalle || "No se pudo exportar el archivo"

    const error = new Error(mensaje)
    error.status = respuesta.status
    return error
}

export async function exportarCalificaciones(token, cursoId) {
    const respuesta = await fetch(
        `${API_URL}/calificaciones/curso/${cursoId}/export`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    )

    if (!respuesta.ok) {
        throw await crearErrorRespuesta(respuesta)
    }

    const blob = await respuesta.blob()
    const disposicion = respuesta.headers.get("Content-Disposition") || ""
    const coincidencia = disposicion.match(/filename="?([^";]+)"?/)
    const nombre = coincidencia
        ? coincidencia[1]
        : `calificaciones_curso_${cursoId}.csv`

    return { blob, nombre }
}
