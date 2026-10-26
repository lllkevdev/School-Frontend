# School Frontend

Interfaz web para administrar cursos, alumnos, inscripciones, evaluaciones y calificaciones sobre [School API](https://github.com/lllkevdev/School-Api).

La aplicación está pensada para dos tipos de usuario:

- **Docente/admin:** gestiona cursos, alumnos, invitaciones y calificaciones.
- **Alumno:** consulta sus cursos, evaluaciones y calificaciones.

## Funcionalidades

- Registro e inicio de sesión con JWT.
- Gestión de cursos: crear, editar, archivar, reactivar y eliminar.
- Gestión de alumnos: listar, inscribir, desactivar y registrar alumnos nuevos.
- Importación masiva de alumnos desde archivos CSV o XLSX.
- Gestión de evaluaciones y calificaciones por curso.
- Exportación de calificaciones a CSV.
- Invitaciones para vincular usuarios con perfiles de alumno.
- Perfil de usuario con actualización de datos y foto.
- Tema claro y oscuro.
- Vistas adaptadas al rol del usuario.

## Stack

- React 19
- Vite 8
- JavaScript
- Vitest
- Testing Library
- jsdom
- ESLint

## Requisitos

- Node.js y npm.
- School API en ejecución.

## Configuración

Copiar el archivo de ejemplo:

```powershell
Copy-Item .env.example .env
```

Configurar la URL del backend en `.env`:

```env
VITE_API_URL=http://localhost:8000
```

## Instalación

```powershell
npm install
```

## Desarrollo

```powershell
npm run dev
```

La aplicación queda disponible en:

```text
http://localhost:5173
```

El backend debe permitir ese origen mediante CORS.

## Scripts

```text
npm run dev        Inicia Vite en modo desarrollo.
npm run build      Genera la versión de producción en dist/.
npm run preview    Sirve la versión compilada.
npm run lint       Ejecuta ESLint.
npm test           Ejecuta la suite de tests una vez.
npm run test:watch Ejecuta Vitest en modo interactivo.
```

## Testing

La suite utiliza Vitest con jsdom y Testing Library.

Actualmente cubre:

- Utilidades académicas.
- Servicio de importación de alumnos.
- Validaciones y resultados de importación en la UI.
- Acciones de cursos: editar, archivar, reactivar y eliminar.
- Hook académico: importación, actualización de inscripciones, errores y sesión expirada.

Para ejecutar los tests:

```powershell
npm test
```

## Estructura

```text
src/
├── components/          Componentes de la interfaz
├── hooks/               Estado y acciones por dominio
├── test/                Configuración de Testing Library
├── academicoService.js  Llamadas a la API académica
├── academicoUtils.js    Utilidades de formato y ordenamiento
├── alumnoService.js     Llamadas a la API de alumnos
├── apiClient.js         Cliente HTTP y manejo de errores
├── App.jsx              Composición principal de la aplicación
└── main.jsx             Punto de entrada de React
```

## Backend

El backend se encuentra en un repositorio separado:

```text
https://github.com/lllkevdev/School-Api
```

Consultar su README para configurar PostgreSQL, variables de entorno y migraciones.
