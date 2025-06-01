import 'styles/error-pages/ErrorPages.css';

function UnauthorizedPage() {
  return (
    <div className="error-page">
      <h1>Acceso no autorizado</h1>
      <p>Debes iniciar sesión para ver esta página.</p>
    </div>
  );
}

export default UnauthorizedPage;
