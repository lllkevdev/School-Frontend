import { useState } from "react"
import { iniciarSesion } from "../authService"

function Login({ onLogin }) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [cargando, setCargando] = useState(false)
    const [error, setError] = useState("")

    async function login() {
        setError("")

        if (!email.trim() || !password.trim()) {
            setError("Completá el correo y la contraseña")
            return
        }

        setCargando(true)

        try {
            const datos = await iniciarSesion(email, password)
            onLogin(datos.access_token)
        } catch (error) {
            if (error.status) {
                setError("Correo o contraseña incorrectos")
            } else {
                setError("No se pudo conectar con el servidor")
            }
        } finally {
            setCargando(false)
        }
    }
    return (
        <div className="login-pantalla">
            <div className="login-tarjeta">
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        login()
                    }}
                >        
                <div className="login-avatar" aria-hidden="true">
                    <svg viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="50" fill="#7E22CE" />
                        <circle cx="50" cy="36" r="16" fill="#F3E8FF" />
                        <path
                            d="M20 90 C20 66 33 54 50 54 C67 54 80 66 80 90"
                            fill="#F3E8FF"
                        />
                    </svg>
                </div>
                
                <h2>School Admin</h2>
                <p>Inicia Sesión para continuar</p>
                
                <label htmlFor="email">Email</label>
                <input 
                    id="email"
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                />

                <label htmlFor="password">Contraseña</label>
                <input 
                    id="password"
                    type="password" 
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                />

                <button
                    type="submit" 
                    className="login-boton"
                    disabled={cargando}
                >
                    {cargando ? "Iniciando sesión..." : "Iniciar sesión"}
                </button>

                {error && (
                    <p className="login-error" role="alert">
                        {error}
                    </p>
                )}
            </form>
        </div>
    </div>
    )
}

export default Login