import { API_URL, procesarRespuesta } from "./apiClient"

export async function obtenerCursos(token) {
    const respuesta = await fetch(`${API_URL}/cursos/`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    return await procesarRespuesta(respuesta)
}


export async function crearCurso(token, curso) {
    const respuesta = await fetch(`${API_URL}/cursos/`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(curso)
    })

    return await procesarRespuesta(respuesta)
}


export async function actualizarCurso(token, cursoId, curso) {
    const respuesta = await fetch(`${API_URL}/cursos/${cursoId}`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(curso)
    })

    return await procesarRespuesta(respuesta)
}


export async function archivarCurso(token, cursoId) {
    const respuesta = await fetch(`${API_URL}/cursos/${cursoId}/archivar`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    return await procesarRespuesta(respuesta)
}


export async function reactivarCurso(token, cursoId) {
    const respuesta = await fetch(`${API_URL}/cursos/${cursoId}/reactivar`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    return await procesarRespuesta(respuesta)
}


export async function eliminarCurso(token, cursoId) {
    const respuesta = await fetch(`${API_URL}/cursos/${cursoId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    return await procesarRespuesta(respuesta)
}
