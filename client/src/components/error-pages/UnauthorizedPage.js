import 'styles/error-pages/ErrorPages.css';

function UnauthorizedPage() {
  return (
    <div className="error-page">
      <h1>Perfil no disponible</h1>
      <p>Necesitas iniciar sesión para ver tu perfil de usuario.</p>
    </div>
  );
}

export default UnauthorizedPage;
