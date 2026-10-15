const API_URL = "http://localhost:8000"

export async function iniciarSesion(email, password) {
    const respuesta = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    })

    const datos = await respuesta.json()

    if (!respuesta.ok) {
        const error = new Error("Error al iniciar sesión")
        error.status = respuesta.status
        throw error
    }

    return datos
}