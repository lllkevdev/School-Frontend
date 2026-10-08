import { useState } from "react"
import Alumno from "./components/Alumno"

function App() {
  const [contador, setContador] = useState(0)

  const [mensaje, setMensaje] = useState("")
  function saludar(nombre) {
    setMensaje("Hola " + nombre)
  }

  const alumnos = [
    {id: 1, nombre: "Juan", apellido: "Perez"},
    {id: 2, nombre: "María", apellido: "Becerra"},
    {id: 3, nombre: "Pedro", apellido: "López"}
  ]
  
  return (
    <div>
      <h1>School API</h1>

      <p>Contador: {contador}</p>

      {mensaje && <p>{mensaje}</p>}

      <button onClick={() => setContador(contador + 1)}>
        +1
      </button>
      <button onClick={() => saludar("kevin")} >
        Saludar
      </button>

      <h2>Alumnos</h2>
      <ul>
        {alumnos.map((alumno) => (
          <Alumno
            key={alumno.id}
            id= {alumno.id}
            nombre={alumno.nombre}
            apellido={alumno.apellido}
            onSaludar={saludar}
        />
        ))}
      </ul>
    </div>
  )
}
const numeros = [10, 20, 30, 40, 50]
const resultado = numeros.filter(
  (numero) => numero <= 30 
)
export default App