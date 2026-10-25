import { useState } from "react"

import { registrarCuenta } from "../authService"

function Registro({ onRegistrado, onVolver }) {
    const [nombre, setNombre] = useState("")
    const [apellido, setApellido] = useState("")
    const [email, setEmail] = useState("")
    const [telefono, setTelefono] = useState("")
    const [password, setPassword] = useState("")
    const [confirmacion, setConfirmacion] = useState("")
    const [cargando, setCargando] = useState(false)
    const [error, setError] = useState("")

    async function registrar(evento) {
        evento.preventDefault()
        setError("")

        if (nombre.trim().length < 2) {
            setError("El nombre debe tener al menos 2 caracteres")
            return
        }

        if (!email.trim()) {
            setError("El correo es obligatorio")
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
            const datos = await registrarCuenta({
                nombre,
                apellido: apellido.trim() || null,
                email,
                telefono: telefono.trim() || null,
                password
            })

            onRegistrado(datos.access_token)
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
        <form onSubmit={registrar}>
            <h2>Crear cuenta</h2>
            <p>Registrate como docente o administrador</p>

            <label htmlFor="registro-nombre">Nombre</label>
            <input
                id="registro-nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                autoComplete="given-name"
                minLength={2}
                maxLength={100}
                required
                placeholder="Nombre"
            />

            <label htmlFor="registro-apellido">Apellido</label>
            <input
                id="registro-apellido"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                autoComplete="family-name"
                minLength={2}
                maxLength={100}
                placeholder="Apellido (opcional)"
            />

            <label htmlFor="registro-email">Email</label>
            <input
                id="registro-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                placeholder="Email"
            />

            <label htmlFor="registro-telefono">Teléfono</label>
            <input
                id="registro-telefono"
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                autoComplete="tel"
                maxLength={30}
                placeholder="Teléfono (opcional)"
            />

            <label htmlFor="registro-password">Contraseña</label>
            <input
                id="registro-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                maxLength={100}
                required
                placeholder="Mínimo 8 caracteres"
            />

            <label htmlFor="registro-confirmacion">
                Confirmar contraseña
            </label>
            <input
                id="registro-confirmacion"
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
                {cargando ? "Creando cuenta..." : "Crear cuenta"}
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

export default Registro
