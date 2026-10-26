import { useEffect, useState } from "react"

import {
    actualizarMiPerfil,
    eliminarFotoPerfil,
    obtenerFotoPerfil,
    obtenerMiPerfil,
    subirFotoPerfil
} from "../perfilService"

function usePerfil(token, cerrarSesion) {
    const [perfil, setPerfil] = useState(null)
    const [tokenPerfil, setTokenPerfil] = useState(null)
    const [cargandoPerfil, setCargandoPerfil] = useState(false)
    const [errorPerfil, setErrorPerfil] = useState("")

    const [guardando, setGuardando] = useState(false)
    const [errorGuardado, setErrorGuardado] = useState("")
    const [mensajeGuardado, setMensajeGuardado] = useState("")

    const [foto, setFoto] = useState({ clave: null, url: null })
    const [cargandoFoto, setCargandoFoto] = useState(false)
    const [errorFoto, setErrorFoto] = useState("")
    const [mensajeFoto, setMensajeFoto] = useState("")

    const perfilActual = tokenPerfil === token ? perfil : null
    const errorPerfilActual = tokenPerfil === token ? errorPerfil : ""
    const claveFoto = perfilActual?.usuario?.foto_perfil ?? null
    const fotoUrl = foto.clave === claveFoto ? foto.url : null

    useEffect(() => {
        if (!token) {
            return
        }

        let cancelado = false

        async function cargarPerfil() {
            setCargandoPerfil(true)
            setErrorPerfil("")

            try {
                const datos = await obtenerMiPerfil(token)

                if (!cancelado) {
                    setPerfil(datos)
                    setTokenPerfil(token)
                }
            } catch (error) {
                if (cancelado) {
                    return
                }

                if (error.status === 401) {
                    cerrarSesion(true)
                    return
                }

                setTokenPerfil(token)
                setErrorPerfil(
                    error.status
                        ? error.message || "No se pudo cargar tu perfil"
                        : "No se pudo conectar con el servidor"
                )
            } finally {
                if (!cancelado) {
                    setCargandoPerfil(false)
                }
            }
        }

        cargarPerfil()

        return () => {
            cancelado = true
        }
    }, [token, cerrarSesion])

    useEffect(() => {
        if (!token || !claveFoto) {
            return
        }

        let cancelado = false
        let urlCreada = null

        async function cargarFoto() {
            setErrorFoto("")

            try {
                const blob = await obtenerFotoPerfil(token)

                if (cancelado) {
                    return
                }

                urlCreada = URL.createObjectURL(blob)
                setFoto({ clave: claveFoto, url: urlCreada })
            } catch (error) {
                if (cancelado) {
                    return
                }

                if (error.status === 401) {
                    cerrarSesion(true)
                    return
                }

                if (error.status !== 404) {
                    setErrorFoto("No se pudo cargar la foto de perfil")
                }
            }
        }

        cargarFoto()

        return () => {
            cancelado = true

            if (urlCreada) {
                URL.revokeObjectURL(urlCreada)
            }
        }
    }, [token, claveFoto, cerrarSesion])

    async function actualizarPerfil(datos) {
        setGuardando(true)
        setErrorGuardado("")
        setMensajeGuardado("")

        try {
            const actualizado = await actualizarMiPerfil(token, datos)
            setPerfil(actualizado)
            setMensajeGuardado("Datos actualizados correctamente")
            return true
        } catch (error) {
            if (error.status === 401) {
                cerrarSesion(true)
                return false
            }

            setErrorGuardado(
                error.status
                    ? error.message || "No se pudieron actualizar tus datos"
                    : "No se pudo conectar con el servidor"
            )

            return false
        } finally {
            setGuardando(false)
        }
    }

    async function subirFoto(archivo) {
        setCargandoFoto(true)
        setErrorFoto("")
        setMensajeFoto("")

        try {
            const actualizado = await subirFotoPerfil(token, archivo)
            setPerfil(actualizado)
            setMensajeFoto("Foto actualizada correctamente")
            return true
        } catch (error) {
            if (error.status === 401) {
                cerrarSesion(true)
                return false
            }

            setErrorFoto(
                error.status
                    ? error.message || "No se pudo actualizar la foto"
                    : "No se pudo conectar con el servidor"
            )

            return false
        } finally {
            setCargandoFoto(false)
        }
    }

    async function eliminarFoto() {
        setCargandoFoto(true)
        setErrorFoto("")
        setMensajeFoto("")

        try {
            const actualizado = await eliminarFotoPerfil(token)
            setPerfil(actualizado)
            setMensajeFoto("Foto eliminada correctamente")
            return true
        } catch (error) {
            if (error.status === 401) {
                cerrarSesion(true)
                return false
            }

            setErrorFoto(
                error.status
                    ? error.message || "No se pudo eliminar la foto"
                    : "No se pudo conectar con el servidor"
            )

            return false
        } finally {
            setCargandoFoto(false)
        }
    }

    return {
        perfil: perfilActual,
        cargandoPerfil,
        errorPerfil: errorPerfilActual,
        guardando,
        errorGuardado,
        mensajeGuardado,
        actualizarPerfil,
        fotoUrl,
        cargandoFoto,
        errorFoto,
        mensajeFoto,
        subirFoto,
        eliminarFoto
    }
}

export default usePerfil
