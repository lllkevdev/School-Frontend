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
