import { API_URL, procesarRespuesta } from "./apiClient"

export async function obtenerAlumnos(token) {
    const respuesta = await fetch(`${API_URL}/alumnos/`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    return await procesarRespuesta(respuesta)
}


export async function desactivarAlumno(token, id) {
    const respuesta = await fetch(`${API_URL}/alumnos/${id}/desactivar`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    return await procesarRespuesta(respuesta)
}
