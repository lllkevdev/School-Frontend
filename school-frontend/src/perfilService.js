import { API_URL, procesarRespuesta } from "./apiClient"

function cabeceraAutorizacion(token) {
    return {
        Authorization: `Bearer ${token}`
    }
}

export async function obtenerMiPerfil(token) {
    const respuesta = await fetch(`${API_URL}/perfil/me`, {
        headers: cabeceraAutorizacion(token)
    })

    return await procesarRespuesta(respuesta)
}

export async function actualizarMiPerfil(token, datos) {
    const respuesta = await fetch(`${API_URL}/perfil/me`, {
        method: "PATCH",
        headers: {
            ...cabeceraAutorizacion(token),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(datos)
    })

    return await procesarRespuesta(respuesta)
}

export async function subirFotoPerfil(token, archivo) {
    const datos = new FormData()
    datos.append("foto", archivo)

    const respuesta = await fetch(`${API_URL}/perfil/me/foto`, {
        method: "POST",
        headers: cabeceraAutorizacion(token),
        body: datos
    })

    return await procesarRespuesta(respuesta)
}

export async function eliminarFotoPerfil(token) {
    const respuesta = await fetch(`${API_URL}/perfil/me/foto`, {
        method: "DELETE",
        headers: cabeceraAutorizacion(token)
    })

    return await procesarRespuesta(respuesta)
}

export async function obtenerFotoPerfil(token) {
    const respuesta = await fetch(`${API_URL}/perfil/me/foto`, {
        headers: cabeceraAutorizacion(token)
    })

    if (!respuesta.ok) {
        await procesarRespuesta(respuesta)
    }

    return await respuesta.blob()
}
