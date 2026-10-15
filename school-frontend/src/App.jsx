import { useState, useCallback, useEffect } from "react"

import useAlumnos from "./hooks/useAlumnos"
import Login from "./components/login"
import Alumnos from "./components/Alumnos"
import FormularioAlumno from "./components/FormularioAlumno"
import Sidebar from "./components/Sidebar"
import Header from "./components/Header"
import ModalEdicionAlumno from "./components/ModalEdicionAlumno"

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

  useEffect(() => {
    localStorage.setItem("tema", tema)
    document.documentElement.setAttribute("data-tema", tema)
  }, [tema])

  const [mensajeSesion, setMensajeSesion] = useState("")

  function manejarLogin(nuevoToken) {
    localStorage.setItem("token", nuevoToken)
    setToken(nuevoToken)
  }

  const cerrarSesion = useCallback((sesionExpirada = false) => {
    localStorage.removeItem("token")
    setToken(null)

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

  function prepararEdicion(id) {
    const alumnoEncontrado = alumnos.find(
      (alumno) => alumno.id === id
    )

    if (!alumnoEncontrado) {
      return
    }

    setIdEdicion(alumnoEncontrado.id)
    setNombreEdicion(alumnoEncontrado.nombre)
    setApellidoEdicion(alumnoEncontrado.apellido)
    setEdadEdicion(String(alumnoEncontrado.edad))
  }

  const {
    alumnos,
    errorCarga,
    cargandoAlumnos,
    agregarAlumno,
    cargando,
    error,
    guardarEdicion,
    cargandoEdicion,
    errorEdicion,
    eliminarAlumno,
    cargandoEliminacion,
    errorEliminacion,
    informarError
  } = useAlumnos(token, manejarSesionExpirada)

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
  const [edad, setEdad] = useState("")

  const [idEdicion, setIdEdicion] = useState(null)

  const [nombreEdicion, setNombreEdicion] = useState("")
  const [apellidoEdicion, setApellidoEdicion] = useState("")
  const [edadEdicion, setEdadEdicion] = useState("")

  const cerrarModalEdicion = () => {
    setIdEdicion(null)
    setNombreEdicion("")
    setApellidoEdicion("")
    setEdadEdicion("")
  }

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
      onPrepararEliminacion={(id) => setIdConfirmacion(id)}
      onPrepararEdicion={prepararEdicion}
      idConfirmacion={idConfirmacion}
      errorEliminacion={errorEliminacion}
      cargandoEliminacion={cargandoEliminacion}
      onEliminar={async (id) => {
        const eliminado = await eliminarAlumno(id)

        if (eliminado) {
            setIdConfirmacion(null)
          }
        }}
        onCancelarEliminacion={() => setIdConfirmacion(null)}
      />
    
    {subseccionAlumnos === "crear" && (
      <FormularioAlumno
        modo="crear"
        nombre={nombre}
        setNombre={setNombre}
        apellido={apellido}
        setApellido={setApellido}
        edad={edad}
        setEdad={setEdad}
        informarError={informarError}
        onGuardar={async () => {
          const creado = await agregarAlumno(nombre, apellido, edad)

          if (creado) {
            setNombre("")
            setApellido("")
            setEdad("")
          }
        }}
        cargando={cargando}
        error={error}
      />
    )}


    {idEdicion !== null && (
      <ModalEdicionAlumno
        nombre={nombreEdicion}
        setNombre={setNombreEdicion}
        apellido={apellidoEdicion}
        edad={edadEdicion}
        setEdad={setEdadEdicion}
        informarError={informarError}
        onCerrar={cerrarModalEdicion}
        onGuardar={async () => {
          const actualizado = await guardarEdicion(
            idEdicion,
            nombreEdicion,
            apellidoEdicion,
            edadEdicion
          )

          if (actualizado) {
            cerrarModalEdicion()
          }
        }}
        cargando={cargandoEdicion}
        error={errorEdicion}
      />
    )}
    </main>
  </div>
</div>
)
}
export default App