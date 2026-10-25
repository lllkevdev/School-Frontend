function Alumno({ activo, onDesactivar }) {
    return (
        <div className="acciones-alumno-botones">
            <button
                type="button"
                className="btn-desactivar"
                onClick={onDesactivar}
                disabled={!activo}
            >
                {activo ? "Desactivar" : "Inactivo"}
            </button>
        </div>
    )
}

export default Alumno
