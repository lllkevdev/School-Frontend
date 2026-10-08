

function Alumno({id, nombre, apellido, onSaludar}) {
    return (
    <div>
    <p>
        {id} {nombre} {apellido}
    </p>
    <button onClick={() => onSaludar(nombre)}>
        Saludar
    </button>
    </div>
    )
}

export default Alumno