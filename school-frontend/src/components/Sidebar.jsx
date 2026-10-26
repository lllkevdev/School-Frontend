function Sidebar({ seccionActiva, onCambiarSeccion, esAdmin }) {
    const secciones = esAdmin
        ? [
            { id: "alumnos", nombre: "Mis alumnos" },
            { id: "cursos", nombre: "Cursos" },
            { id: "invitaciones", nombre: "Invitaciones" },
            { id: "academico", nombre: "Académico" },
            { id: "perfil", nombre: "Mi perfil" },
        ]
        : [
            { id: "academico", nombre: "Mis cursos" },
            { id: "perfil", nombre: "Mi perfil" },
        ]

    return (
        <aside className="sidebar">
        <h2>{esAdmin ? "School Docente" : "School Alumno"}</h2>

        <nav>
            {secciones.map((seccion) => (
            <button
                key={seccion.id}
                className={
                seccionActiva === seccion.id ? "activo" : ""
                }
                onClick={() => onCambiarSeccion(seccion.id)}
            >
                {seccion.nombre}
            </button>
        ))}
        </nav>
    </aside>
    )
}

export default Sidebar