import { useState } from "react"

const TIPOS_FOTO = new Set([
    "image/jpeg",
    "image/png",
    "image/webp"
])

const TAMANO_MAXIMO_FOTO = 2 * 1024 * 1024

function formatearFecha(fecha) {
    if (!fecha) {
        return "-"
    }

    const [anio, mes, dia] = fecha.split("-")

    return `${dia}/${mes}/${anio}`
}

function AvatarPorDefecto({ nombre, apellido }) {
    const iniciales = `${nombre?.[0] ?? ""}${apellido?.[0] ?? ""}`

    return (
        <div className="perfil-avatar perfil-avatar-vacio" aria-hidden="true">
            {iniciales.toUpperCase() || "?"}
        </div>
    )
}

function MiPerfil({
    perfil,
    fotoUrl,
    cargandoFoto,
    errorFoto,
    mensajeFoto,
    guardando,
    errorGuardado,
    mensajeGuardado,
    onActualizar,
    onSubirFoto,
    onEliminarFoto
}) {
    const usuario = perfil.usuario
    const alumno = perfil.alumno

    const [nombre, setNombre] = useState(usuario.nombre)
    const [apellido, setApellido] = useState(usuario.apellido ?? "")
    const [telefono, setTelefono] = useState(usuario.telefono ?? "")
    const [errorFormulario, setErrorFormulario] = useState("")
    const [errorArchivo, setErrorArchivo] = useState("")

    const nombreNormalizado = nombre.trim()
    const apellidoNormalizado = apellido.trim()
    const telefonoNormalizado = telefono.trim()

    const hayCambios =
        nombreNormalizado !== usuario.nombre ||
        apellidoNormalizado !== (usuario.apellido ?? "") ||
        telefonoNormalizado !== (usuario.telefono ?? "")

    const esDocente = usuario.rol === "admin"

    async function seleccionarFoto(evento) {
        const archivo = evento.target.files?.[0]
        evento.target.value = ""
        setErrorArchivo("")

        if (!archivo) {
            return
        }

        if (archivo.type && !TIPOS_FOTO.has(archivo.type)) {
            setErrorArchivo(
                "La foto debe ser un archivo JPEG, PNG o WebP"
            )
            return
        }

        if (archivo.size > TAMANO_MAXIMO_FOTO) {
            setErrorArchivo("La foto no puede superar los 2 MB")
            return
        }

        await onSubirFoto(archivo)
    }

    async function guardar(evento) {
        evento.preventDefault()
        setErrorFormulario("")

        if (nombreNormalizado.length < 2) {
            setErrorFormulario("El nombre debe tener al menos 2 caracteres")
            return
        }

        if (apellidoNormalizado.length < 2) {
            setErrorFormulario("El apellido debe tener al menos 2 caracteres")
            return
        }

        if (telefonoNormalizado.length > 30) {
            setErrorFormulario("El teléfono no puede superar los 30 caracteres")
            return
        }

        if (!hayCambios) {
            setErrorFormulario("No hay cambios para guardar")
            return
        }

        const actualizado = await onActualizar({
            nombre: nombreNormalizado,
            apellido: apellidoNormalizado,
            telefono: telefonoNormalizado || null
        })

        if (actualizado) {
            setNombre(nombreNormalizado)
            setApellido(apellidoNormalizado)
            setTelefono(telefonoNormalizado)
        }
    }

    function restablecer() {
        setNombre(usuario.nombre)
        setApellido(usuario.apellido ?? "")
        setTelefono(usuario.telefono ?? "")
        setErrorFormulario("")
    }

    return (
        <section className="perfil-seccion">
            <div className="perfil-encabezado">
                <div className="perfil-foto">
                    {fotoUrl ? (
                        <img
                            className="perfil-avatar"
                            src={fotoUrl}
                            alt={`Foto de perfil de ${usuario.nombre}`}
                        />
                    ) : (
                        <AvatarPorDefecto
                            nombre={usuario.nombre}
                            apellido={usuario.apellido}
                        />
                    )}

                    <div className="perfil-foto-acciones">
                        <label
                            className={
                                cargandoFoto
                                    ? "perfil-boton-archivo deshabilitado"
                                    : "perfil-boton-archivo"
                            }
                        >
                            {cargandoFoto
                                ? "Procesando..."
                                : usuario.foto_perfil
                                    ? "Cambiar foto"
                                    : "Subir foto"}

                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={seleccionarFoto}
                                disabled={cargandoFoto}
                            />
                        </label>

                        {usuario.foto_perfil && (
                            <button
                                type="button"
                                className="perfil-boton-secundario"
                                onClick={onEliminarFoto}
                                disabled={cargandoFoto}
                            >
                                Eliminar foto
                            </button>
                        )}
                    </div>

                    <p className="perfil-ayuda">
                        JPEG, PNG o WebP. Máximo 2 MB.
                    </p>

                    {errorArchivo && (
                        <p className="mensaje-error" role="alert">
                            {errorArchivo}
                        </p>
                    )}

                    {errorFoto && (
                        <p className="mensaje-error" role="alert">
                            {errorFoto}
                        </p>
                    )}

                    {mensajeFoto && (
                        <p className="perfil-mensaje-exito" role="status">
                            {mensajeFoto}
                        </p>
                    )}
                </div>

                <div className="perfil-identidad">
                    <p className="perfil-etiqueta">
                        {esDocente ? "Cuenta docente" : "Cuenta alumno"}
                    </p>

                    <h2>
                        {usuario.nombre} {usuario.apellido}
                    </h2>

                    <p>{usuario.email}</p>

                    <div className="perfil-insignias">
                        <span
                            className={
                                usuario.activo
                                    ? "perfil-estado activo"
                                    : "perfil-estado inactivo"
                            }
                        >
                            {usuario.activo ? "Cuenta activa" : "Cuenta inactiva"}
                        </span>

                        {alumno && (
                            <span
                                className={
                                    alumno.activo
                                        ? "perfil-estado activo"
                                        : "perfil-estado inactivo"
                                }
                            >
                                {alumno.activo
                                    ? "Perfil académico activo"
                                    : "Perfil académico inactivo"}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="perfil-contenido">
                <form className="perfil-tarjeta perfil-formulario" onSubmit={guardar}>
                    <h2>Datos de la cuenta</h2>
                    <p className="perfil-descripcion">
                        Podés actualizar tu nombre, apellido y teléfono.
                        El correo, el rol y el estado los administra el sistema.
                    </p>

                    <div className="perfil-campos">
                        <div className="perfil-campo">
                            <label htmlFor="perfil-nombre">Nombre</label>
                            <input
                                id="perfil-nombre"
                                value={nombre}
                                onChange={(e) => {
                                    setNombre(e.target.value)
                                    setErrorFormulario("")
                                }}
                                autoComplete="given-name"
                                minLength={2}
                                maxLength={100}
                                required
                            />
                        </div>

                        <div className="perfil-campo">
                            <label htmlFor="perfil-apellido">Apellido</label>
                            <input
                                id="perfil-apellido"
                                value={apellido}
                                onChange={(e) => {
                                    setApellido(e.target.value)
                                    setErrorFormulario("")
                                }}
                                autoComplete="family-name"
                                minLength={2}
                                maxLength={100}
                                required
                            />
                        </div>

                        <div className="perfil-campo">
                            <label htmlFor="perfil-telefono">Teléfono</label>
                            <input
                                id="perfil-telefono"
                                type="tel"
                                value={telefono}
                                onChange={(e) => {
                                    setTelefono(e.target.value)
                                    setErrorFormulario("")
                                }}
                                autoComplete="tel"
                                maxLength={30}
                                placeholder="Teléfono (opcional)"
                            />
                        </div>

                        <div className="perfil-campo">
                            <label htmlFor="perfil-email">Email</label>
                            <input
                                id="perfil-email"
                                type="email"
                                value={usuario.email}
                                readOnly
                                disabled
                            />
                        </div>
                    </div>

                    {errorFormulario && (
                        <p className="mensaje-error" role="alert">
                            {errorFormulario}
                        </p>
                    )}

                    {errorGuardado && !hayCambios && (
                        <p className="mensaje-error" role="alert">
                            {errorGuardado}
                        </p>
                    )}

                    {mensajeGuardado && !hayCambios && (
                        <p className="perfil-mensaje-exito" role="status">
                            {mensajeGuardado}
                        </p>
                    )}

                    <div className="acciones-perfil">
                        <button
                            type="submit"
                            disabled={guardando || !hayCambios}
                        >
                            {guardando ? "Guardando..." : "Guardar cambios"}
                        </button>

                        <button
                            type="button"
                            className="perfil-boton-secundario"
                            onClick={restablecer}
                            disabled={guardando || !hayCambios}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>

                <div className="perfil-columna">
                    <section className="perfil-tarjeta">
                        <h2>Cuenta</h2>

                        <dl className="perfil-datos">
                            <div>
                                <dt>Email</dt>
                                <dd>{usuario.email}</dd>
                            </div>
                            <div>
                                <dt>Rol</dt>
                                <dd>{esDocente ? "Docente" : "Alumno"}</dd>
                            </div>
                            <div>
                                <dt>Estado</dt>
                                <dd>{usuario.activo ? "Activo" : "Inactivo"}</dd>
                            </div>
                        </dl>
                    </section>

                    {alumno ? (
                        <section className="perfil-tarjeta">
                            <h2>Perfil académico</h2>

                            <dl className="perfil-datos">
                                <div>
                                    <dt>Nombre</dt>
                                    <dd>{alumno.nombre}</dd>
                                </div>
                                <div>
                                    <dt>Apellido</dt>
                                    <dd>{alumno.apellido}</dd>
                                </div>
                                <div>
                                    <dt>Documento</dt>
                                    <dd>{alumno.documento_identidad}</dd>
                                </div>
                                <div>
                                    <dt>Nacimiento</dt>
                                    <dd>{formatearFecha(alumno.fecha_nacimiento)}</dd>
                                </div>
                                <div>
                                    <dt>Estado</dt>
                                    <dd>{alumno.activo ? "Activo" : "Inactivo"}</dd>
                                </div>
                            </dl>

                            <p className="perfil-ayuda">
                                Los datos académicos los administra tu docente.
                            </p>
                        </section>
                    ) : (
                        <section className="perfil-tarjeta">
                            <h2>Gestión académica</h2>
                            <p className="perfil-descripcion">
                                Administrá tus cursos, alumnos, invitaciones y
                                calificaciones desde el menú lateral.
                            </p>
                        </section>
                    )}
                </div>
            </div>
        </section>
    )
}

export default MiPerfil
