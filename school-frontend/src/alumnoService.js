
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000"

async function procesarRespuesta(respuesta) {
    if (respuesta.status === 204) {
        return null
    }
    
    if (!respuesta.ok) {
        let datosError

        try {
            datosError = await respuesta.json()
        } catch {
            // La respuesta no contenía JSON válido
        }

        const detalle = datosError?.detail

        const mensaje = Array.isArray(detalle)
            ? detalle.map((error) => error.msg).join(" - ")
            : detalle || "Error al procesar la respuesta del servidor"
        const errorHttp = new Error(mensaje)
        errorHttp.status = respuesta.status

        throw errorHttp
    }

    return await respuesta.json()
}

export async function obtenerAlumnos(token) {
    const respuesta = await fetch(`${API_URL}/alumnos/`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    return await procesarRespuesta(respuesta)
}


export async function crearAlumno(token, alumno) {
    const respuesta = await fetch(`${API_URL}/alumnos/`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(alumno)
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
