import { useState, useCallback, useEffect } from "react"

import useAlumnos from "./hooks/useAlumnos"
import useCursos from "./hooks/useCursos"
import useInvitaciones from "./hooks/useInvitaciones"
import usePerfil from "./hooks/usePerfil"
import Login from "./components/Login"
import Alumnos from "./components/Alumnos"
import FormularioAlumno from "./components/FormularioAlumno"
import Cursos from "./components/Cursos"
import Invitaciones from "./components/Invitaciones"
import AcademicoAdmin from "./components/AcademicoAdmin"
import AcademicoAlumno from "./components/AcademicoAlumno"
import MiPerfil from "./components/MiPerfil"
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

    if (sesionExpirada) {
      setMensajeSesion(
        "Tu sesión expiró por seguridad. Iniciá sesión nuevamente para continuar."
      )
    } else {
      setMensajeSesion("")
    }
  }, [])

  const manejarSesionExpirada = useCallback(() => {
    cerrarSesion(true)
  }, [cerrarSesion])

  const {
    perfil,
    errorPerfil,
    guardando: guardandoPerfil,
    errorGuardado: errorGuardadoPerfil,
    mensajeGuardado: mensajeGuardadoPerfil,
    actualizarPerfil,
    fotoUrl,
    cargandoFoto,
    errorFoto,
    mensajeFoto,
    subirFoto,
    eliminarFoto
  } = usePerfil(token, manejarSesionExpirada)

  const esAdmin = perfil?.usuario?.rol === "admin"

  const {
    alumnos,
    errorCarga: errorCargaAlumnos,
    cargandoAlumnos,
    agregarAlumno,
    incorporarAlumno,
    cargando: creandoAlumno,
    error: errorAlumno,
    desactivarAlumno,
    cargandoDesactivacion,
    errorDesactivacion,
    informarError
  } = useAlumnos(token, manejarSesionExpirada, esAdmin)

  const {
    cursos,
    cargandoCursos,
    errorCarga: errorCargaCursos,
    crearCurso,
    creando: creandoCurso,
    errorCrear: errorCrearCurso
  } = useCursos(token, manejarSesionExpirada, esAdmin)

  const {
    invitaciones,
    cargandoInvitaciones,
    errorCarga: errorCargaInvitaciones,
    crearInvitacion,
    creando: creandoInvitacion,
    errorCrear: errorCrearInvitacion,
    creada: invitacionCreada,
    revocarInvitacion,
    revocandoId,
    errorRevocar
  } = useInvitaciones(token, manejarSesionExpirada, esAdmin)

  const [seccionActiva, setSeccionActiva] = useState("alumnos")

  const titulosSecciones = {
    alumnos: "Alumnos",
    cursos: "Cursos",
    invitaciones: "Invitaciones",
    academico: esAdmin ? "Académico" : "Mis cursos",
    perfil: "Mi perfil",
  }

  const seccionActual = esAdmin
    ? seccionActiva
    : seccionActiva === "perfil"
      ? "perfil"
      : "academico"

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

  return (
    <div data-tema={tema}>
      <div className="dashboard-layout">
        <Sidebar
          seccionActiva={seccionActual}
          onCambiarSeccion={setSeccionActiva}
          esAdmin={esAdmin}
        />

        <main className="dashboard-main">
          <Header
            titulo={titulosSecciones[seccionActual]}
            tema={tema}
            onCambiarTema={() => {
              setTema(tema === "claro" ? "oscuro" : "claro")
            }}
            onCerrarSesion={() => cerrarSesion()}
          />

          {seccionActual === "alumnos" && (
            <>
              {cargandoAlumnos && <p>Cargando alumnos...</p>}

              {errorCargaAlumnos && (
                <p className="mensaje-error" role="alert">
                  {errorCargaAlumnos}
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
                  cargando={creandoAlumno}
                  error={errorAlumno}
                />
              )}
            </>
          )}

          {seccionActual === "cursos" && (
            <Cursos
              cursos={cursos}
              cargando={cargandoCursos}
              errorCarga={errorCargaCursos}
              onCrear={crearCurso}
              creando={creandoCurso}
              errorCrear={errorCrearCurso}
            />
          )}

          {seccionActual === "invitaciones" && (
            <Invitaciones
              alumnos={alumnos}
              cursos={cursos}
              cargandoAlumnos={cargandoAlumnos}
              errorAlumnos={errorCargaAlumnos}
              invitaciones={invitaciones}
              cargando={cargandoInvitaciones}
              errorCarga={errorCargaInvitaciones}
              onCrear={crearInvitacion}
              creando={creandoInvitacion}
              errorCrear={errorCrearInvitacion}
              creada={invitacionCreada}
              onRevocar={revocarInvitacion}
              revocandoId={revocandoId}
              errorRevocar={errorRevocar}
            />
          )}

          {seccionActual === "academico" && esAdmin && (
            <AcademicoAdmin
              token={token}
              cerrarSesion={manejarSesionExpirada}
              cursos={cursos}
              cargandoCursos={cargandoCursos}
              errorCursos={errorCargaCursos}
              alumnos={alumnos}
              cargandoAlumnos={cargandoAlumnos}
              errorAlumnos={errorCargaAlumnos}
              onAlumnoRegistrado={incorporarAlumno}
              onIrACursos={() => setSeccionActiva("cursos")}
            />
          )}

          {seccionActual === "academico" && !esAdmin && (
            <AcademicoAlumno
              token={token}
              cerrarSesion={manejarSesionExpirada}
            />
          )}

          {seccionActual === "perfil" && (
            <MiPerfil
              perfil={perfil}
              fotoUrl={fotoUrl}
              cargandoFoto={cargandoFoto}
              errorFoto={errorFoto}
              mensajeFoto={mensajeFoto}
              guardando={guardandoPerfil}
              errorGuardado={errorGuardadoPerfil}
              mensajeGuardado={mensajeGuardadoPerfil}
              onActualizar={actualizarPerfil}
              onSubirFoto={subirFoto}
              onEliminarFoto={eliminarFoto}
            />
          )}

        </main>
      </div>
    </div>
  )
}

export default App
