import { useEffect, useState } from "react"

import {
    crearInvitacion as crearInvitacionApi,
    obtenerInvitaciones,
    revocarInvitacion as revocarInvitacionApi
} from "../invitacionService"

function useInvitaciones(token, cerrarSesion, habilitado = true) {
    const [invitaciones, setInvitaciones] = useState([])
    const [cargandoInvitaciones, setCargandoInvitaciones] = useState(false)
    const [errorCarga, setErrorCarga] = useState("")
    const [creando, setCreando] = useState(false)
    const [errorCrear, setErrorCrear] = useState("")
    const [creada, setCreada] = useState(null)
    const [revocandoId, setRevocandoId] = useState(null)
    const [errorRevocar, setErrorRevocar] = useState("")

    useEffect(() => {
        if (!token || !habilitado) {
            return
        }

        let cancelado = false

        async function cargarInvitaciones() {
            setCargandoInvitaciones(true)
            setErrorCarga("")

            try {
                const datos = await obtenerInvitaciones(token)

                if (!cancelado) {
                    setInvitaciones(datos)
                }
            } catch (error) {
                if (cancelado) {
                    return
                }

                if (error.status === 401) {
                    cerrarSesion(true)
                    return
                }

                setErrorCarga(
                    error.status
                        ? error.message
                            || "No se pudieron cargar las invitaciones"
                        : "No se pudo conectar con el servidor"
                )
            } finally {
                if (!cancelado) {
                    setCargandoInvitaciones(false)
                }
            }
        }

        cargarInvitaciones()

        return () => {
            cancelado = true
        }
    }, [token, cerrarSesion, habilitado])

    async function crearInvitacion(datos) {
        setCreando(true)
        setErrorCrear("")

        try {
            const nueva = await crearInvitacionApi(token, datos)

            setInvitaciones((invitacionesActuales) => [
                nueva,
                ...invitacionesActuales
            ])
            setCreada(nueva)

            return nueva
        } catch (error) {
            if (error.status === 401) {
                cerrarSesion(true)
                return null
            }

            setErrorCrear(
                error.status
                    ? error.message || "No se pudo crear la invitación"
                    : "No se pudo conectar con el servidor"
            )

            return null
        } finally {
            setCreando(false)
        }
    }

    async function revocarInvitacion(id) {
        setRevocandoId(id)
        setErrorRevocar("")

        try {
            await revocarInvitacionApi(token, id)

            setInvitaciones((invitacionesActuales) =>
                invitacionesActuales.map((invitacion) =>
                    invitacion.id === id
                        ? { ...invitacion, revocada: true }
                        : invitacion
                )
            )

            return true
        } catch (error) {
            if (error.status === 401) {
                cerrarSesion(true)
                return false
            }

            setErrorRevocar(
                error.status
                    ? error.message || "No se pudo revocar la invitación"
                    : "No se pudo conectar con el servidor"
            )

            return false
        } finally {
            setRevocandoId(null)
        }
    }

    return {
        invitaciones,
        cargandoInvitaciones,
        errorCarga,
        crearInvitacion,
        creando,
        errorCrear,
        creada,
        revocarInvitacion,
        revocandoId,
        errorRevocar
    }
}

export default useInvitaciones
