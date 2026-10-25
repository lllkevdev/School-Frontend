import { API_URL, procesarRespuesta } from "./apiClient"

export async function obtenerInvitaciones(token) {
    const respuesta = await fetch(`${API_URL}/invitaciones/`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    return await procesarRespuesta(respuesta)
}


export async function crearInvitacion(token, invitacion) {
    const respuesta = await fetch(`${API_URL}/invitaciones/`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(invitacion)
    })

    return await procesarRespuesta(respuesta)
}


export async function revocarInvitacion(token, id) {
    const respuesta = await fetch(
        `${API_URL}/invitaciones/${id}/revocar`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    )

    return await procesarRespuesta(respuesta)
}


export async function activarInvitacion(tokenInvitacion, password) {
    const respuesta = await fetch(`${API_URL}/invitaciones/aceptar`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            token: tokenInvitacion,
            password: password
        })
    })

    return await procesarRespuesta(respuesta)
}
