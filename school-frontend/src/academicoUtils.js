const formatoNota = new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
})

const formatoPromedio = new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
})

export function formatearFecha(fecha) {
    if (!fecha) {
        return "-"
    }

    const [anio, mes, dia] = fecha.split("-")

    if (!anio || !mes || !dia) {
        return fecha
    }

    return `${dia}/${mes}/${anio}`
}

export function formatearNota(nota) {
    return formatoNota.format(Number(nota))
}

export function formatearPromedio(promedio) {
    return formatoPromedio.format(promedio)
}

export function nombreAlumno(alumno) {
    return `${alumno.apellido}, ${alumno.nombre}`
}

export function nombreCurso(curso) {
    return `${curso.nombre_materia} · ${curso.division} · ${curso.anio_lectivo}`
}

export function ordenarAlumnos(alumnos) {
    return [...alumnos].sort((a, b) => {
        const apellido = a.apellido.localeCompare(b.apellido, "es")

        if (apellido !== 0) {
            return apellido
        }

        return a.nombre.localeCompare(b.nombre, "es")
    })
}

export function calcularPromedio(calificaciones) {
    if (calificaciones.length === 0) {
        return null
    }

    const total = calificaciones.reduce(
        (suma, calificacion) => suma + calificacion.nota,
        0
    )

    return total / calificaciones.length
}
