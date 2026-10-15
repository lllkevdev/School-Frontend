function Sidebar({ seccionActiva, onCambiarSeccion }) {
    const secciones = [
        { id: "inicio", nombre: "Inicio" },
        { id: "alumnos", nombre: "Alumnos" },
        { id: "materias", nombre: "Materias" },
        { id: "calificaciones", nombre: "Calificaciones" },
        { id: "usuarios", nombre: "Usuarios" },
    ]

    return (
        <aside className="sidebar">
        <h2>School Admin</h2>

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