import { API_URL, procesarRespuesta } from "./apiClient"

export async function iniciarSesion(email, password) {
    const respuesta = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    })

    return await procesarRespuesta(respuesta)
}

export async function registrarCuenta(datos) {
    const respuesta = await fetch(`${API_URL}/auth/registro`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(datos)
    })

    return await procesarRespuesta(respuesta)
}

export async function obtenerPerfil(token) {
    const respuesta = await fetch(`${API_URL}/auth/me`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    return await procesarRespuesta(respuesta)
}
