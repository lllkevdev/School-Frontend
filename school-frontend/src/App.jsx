import { useState, useCallback, useEffect } from "react"

import { obtenerPerfil } from "./authService"
import useAlumnos from "./hooks/useAlumnos"
import Login from "./components/Login"
import Alumnos from "./components/Alumnos"
import FormularioAlumno from "./components/FormularioAlumno"
import Sidebar from "./components/Sidebar"
import Header from "./components/Header"

function obtenerTemaInicial() {
  const temaGuardado = localStorage.getItem("tema")

  if (temaGuardado === "claro" || temaGuardado === "oscuro") {
    return temaGuardado
  }

  return "claro"
}

function App() {

  const [token, setToken] = useState(
    localStorage.getItem("token")
  )

  const [tema, setTema] = useState(obtenerTemaInicial)

  const [mensajeSesion, setMensajeSesion] = useState("")

  const [perfil, setPerfil] = useState(null)
  const [errorPerfil, setErrorPerfil] = useState("")

  useEffect(() => {
    localStorage.setItem("tema", tema)
    document.documentElement.setAttribute("data-tema", tema)
  }, [tema])

  function manejarLogin(nuevoToken) {
    localStorage.setItem("token", nuevoToken)
    setToken(nuevoToken)
  }

  const cerrarSesion = useCallback((sesionExpirada = false) => {
    localStorage.removeItem("token")
    setToken(null)
    setPerfil(null)
    setErrorPerfil("")

    if (sesionExpirada) {
      setMensajeSesion (
        "Tu sesión expiró por seguridad. Iniciá sesión nuevamente para continuar."
      )
    } else {
      setMensajeSesion("")
    }
  }, [])

  const manejarSesionExpirada = useCallback(() => {
    cerrarSesion(true)
  }, [cerrarSesion])

  useEffect(() => {
    if (!token) {
      return
    }

    let cancelado = false

    async function cargarPerfil() {
      setErrorPerfil("")

      try {
        const datos = await obtenerPerfil(token)

        if (!cancelado) {
          setPerfil(datos)
        }
      } catch (error) {
        if (cancelado) {
          return
        }

        if (error.status === 401) {
          cerrarSesion(true)
          return
        }

        setErrorPerfil(
          error.status
            ? error.message
            : "No se pudo conectar con el servidor"
        )
      }
    }

    cargarPerfil()

    return () => {
      cancelado = true
    }
  }, [token, cerrarSesion])

  const esAdmin = perfil?.rol === "admin"

  const {
    alumnos,
    errorCarga,
    cargandoAlumnos,
    agregarAlumno,
    cargando,
    error,
    desactivarAlumno,
    cargandoDesactivacion,
    errorDesactivacion,
    informarError
  } = useAlumnos(token, manejarSesionExpirada, esAdmin)

  const [seccionActiva, setSeccionActiva] = useState("alumnos")

  const titulosSecciones = {
    inicio: "Inicio",
    alumnos: "Alumnos",
    materias: "Materias",
    calificaciones: "Calificaciones",
    usuarios: "Usuarios",
  }

  const [subseccionAlumnos, setSubseccionAlumnos] = useState("listado")

  const [idConfirmacion, setIdConfirmacion] = useState(null)

  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [documentoIdentidad, setDocumentoIdentidad] = useState("")
  const [fechaNacimiento, setFechaNacimiento] = useState("")

  if (!token) {
    return (
      <div data-tema={tema}>
        {mensajeSesion && (
          <div role="alert">
            <p>{mensajeSesion}</p>
            <button onClick={() => setMensajeSesion("")}>
              Aceptar
            </button>
          </div>
        )}

        <Login onLogin={manejarLogin}/>
      </div>
    )
  }

  if (!perfil) {
    return (
      <div data-tema={tema} className="login-pantalla">
        <div className="login-tarjeta">
          {errorPerfil ? (
            <>
              <h2>No se pudo cargar la sesión</h2>
              <p className="login-error" role="alert">
                {errorPerfil}
              </p>
              <button onClick={() => cerrarSesion()}>
                Volver al inicio
              </button>
            </>
          ) : (
            <>
              <h2>Cargando sesión...</h2>
              <p className="login-mensaje">
                Verificando tus permisos.
              </p>
            </>
          )}
        </div>
      </div>
    )
  }

  if (!esAdmin) {
    return (
      <div data-tema={tema} className="login-pantalla">
        <div className="login-tarjeta">
          <h2>Hola, {perfil.nombre}</h2>
          <p className="login-mensaje">
            El panel de alumno todavía no está implementado.
            Próximamente vas a poder consultar tus cursos y calificaciones desde acá.
          </p>
          <button onClick={() => cerrarSesion()}>
            Cerrar sesión
          </button>
        </div>
      </div>
    )
  }

return (
  <div data-tema={tema}>
    <div className="dashboard-layout">
      <Sidebar
        seccionActiva={seccionActiva}
        onCambiarSeccion={setSeccionActiva}
      />

      <main className="dashboard-main">
        <Header
          titulo={titulosSecciones[seccionActiva]}
          tema={tema}
          onCambiarTema={() => {
            setTema(tema === "claro" ? "oscuro" : "claro")
          }}
          onCerrarSesion={() => cerrarSesion()}
        />

        {seccionActiva !== "alumnos" ? (
          <section className="panel-informativo">
            <h2>{titulosSecciones[seccionActiva]}</h2>
            <p>Este módulo todavía no está conectado.</p>
          </section>
        ) : (
          <>
            {cargandoAlumnos && <p>Cargando alumnos...</p>}

            {errorCarga && (
              <p style={{ color: "red" }}>
                {errorCarga}
              </p>
            )}

            <Alumnos
              alumnos={alumnos}
              subseccionAlumnos={subseccionAlumnos}
              onCambiarSubseccion={setSubseccionAlumnos}
              onPrepararDesactivacion={(id) => setIdConfirmacion(id)}
              idConfirmacion={idConfirmacion}
              errorDesactivacion={errorDesactivacion}
              cargandoDesactivacion={cargandoDesactivacion}
              onConfirmarDesactivacion={async (id) => {
                const desactivado = await desactivarAlumno(id)

                if (desactivado) {
                  setIdConfirmacion(null)
                }
              }}
              onCancelarDesactivacion={() => setIdConfirmacion(null)}
            />

            {subseccionAlumnos === "crear" && (
              <FormularioAlumno
                nombre={nombre}
                setNombre={setNombre}
                apellido={apellido}
                setApellido={setApellido}
                documentoIdentidad={documentoIdentidad}
                setDocumentoIdentidad={setDocumentoIdentidad}
                fechaNacimiento={fechaNacimiento}
                setFechaNacimiento={setFechaNacimiento}
                informarError={informarError}
                onGuardar={async () => {
                  const creado = await agregarAlumno(
                    nombre,
                    apellido,
                    documentoIdentidad,
                    fechaNacimiento
                  )

                  if (creado) {
                    setNombre("")
                    setApellido("")
                    setDocumentoIdentidad("")
                    setFechaNacimiento("")
                  }
                }}
                cargando={cargando}
                error={error}
              />
            )}
          </>
        )}
    </main>
  </div>
</div>
)
}
export default App
