function Header({
    titulo,
    tema,
    onCambiarTema,
    onCerrarSesion,
    }) {
    return (
        <header className="dashboard-header">
            <div>
                <h1>{titulo}</h1>
            </div>

            <div className="header-acciones">
                <button 
                    onClick={onCambiarTema}
                    aria-label={
                        tema === "claro"
                            ? "Activar modo oscuro"
                            : "Activar modo claro"
                        }
                    title={
                        tema === "claro"
                            ? "Activar modo oscuro"
                            : "Activar modo claro"
                    }
                >
                    {tema === "claro" ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="21"
                            height="21"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" />
                        </svg>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="21"
                            height="21"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <circle cx="12" cy="12" r="4" />
                            <path d="M12 2v2" />
                            <path d="M12 20v2" />
                            <path d="m4.93 4.93 1.42 1.42" />
                            <path d="m17.65 17.65 1.42 1.42" />
                            <path d="M2 12h2" />
                            <path d="M20 12h2" />
                            <path d="m6.35 17.65-1.42 1.42" />
                            <path d="m19.07 4.93-1.42 1.42" />
                        </svg>
                    )}
                </button>
                
                <button onClick={onCerrarSesion}>
                    Cerrar sesión
                </button>
            </div>
        </header>
    )
}

export default Header