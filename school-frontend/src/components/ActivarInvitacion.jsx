import { useState } from "react"

import { activarInvitacion } from "../invitacionService"

function ActivarInvitacion({ tokenInicial, onActivada, onVolver }) {
    const [token, setToken] = useState(tokenInicial)
    const [password, setPassword] = useState("")
    const [confirmacion, setConfirmacion] = useState("")
    const [cargando, setCargando] = useState(false)
    const [error, setError] = useState("")

    async function activar(evento) {
        evento.preventDefault()
        setError("")

        if (token.trim().length < 32) {
            setError("El token de invitación no es válido")
            return
        }

        if (password.length < 8) {
            setError("La contraseña debe tener al menos 8 caracteres")
            return
        }

        if (password !== confirmacion) {
            setError("Las contraseñas no coinciden")
            return
        }

        setCargando(true)

        try {
            const datos = await activarInvitacion(token.trim(), password)
            onActivada(datos.access_token)
        } catch (error) {
            setError(
                error.status
                    ? error.message
                    : "No se pudo conectar con el servidor"
            )
        } finally {
            setCargando(false)
        }
    }

    return (
        <form onSubmit={activar}>
            <h2>Activar invitación</h2>
            <p>Creá tu cuenta de alumno para ingresar al sitio</p>

            {tokenInicial && (
                <p className="login-aviso">
                    Invitación detectada desde el enlace.
                </p>
            )}

            <label htmlFor="activar-token">Token de invitación</label>
            <input
                id="activar-token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                autoComplete="off"
                minLength={32}
                maxLength={512}
                required
                placeholder="Pegá el token que recibiste"
            />

            <label htmlFor="activar-password">Contraseña</label>
            <input
                id="activar-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                maxLength={100}
                required
                placeholder="Mínimo 8 caracteres"
            />

            <label htmlFor="activar-confirmacion">
                Confirmar contraseña
            </label>
            <input
                id="activar-confirmacion"
                type="password"
                value={confirmacion}
                onChange={(e) => setConfirmacion(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                maxLength={100}
                required
                placeholder="Repetí la contraseña"
            />

            <button type="submit" disabled={cargando}>
                {cargando ? "Activando..." : "Crear cuenta y entrar"}
            </button>

            {error && (
                <p className="login-error" role="alert">
                    {error}
                </p>
            )}

            <button
                type="button"
                className="login-enlace"
                onClick={onVolver}
            >
                Volver a iniciar sesión
            </button>
        </form>
    )
}

export default ActivarInvitacion
