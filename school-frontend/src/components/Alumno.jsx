function Alumno({ onEliminar, onEditar }) {
    return (
        <div className="acciones-alumno-botones">
            <button
                className="btn-editar"
                onClick={onEditar}
            >
                Editar
            </button>

        <button
            className="btn-eliminar"
            onClick={onEliminar}
        >
            Eliminar
        </button>
        </div>
    )
}

export default Alumno
