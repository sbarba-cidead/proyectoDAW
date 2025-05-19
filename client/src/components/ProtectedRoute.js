import { useUserContext } from '../context/UserContext';
import UnauthorizedPage from './error-pages/UnauthorizedPage';

// impide acceso a la página de perfil de usuario
// si no hay usuario con sesión iniciada

function ProtectedRoute({ children }) {
  const { user, isLoadingUser } = useUserContext();

  if (isLoadingUser) return null;

  return user ? children : <UnauthorizedPage />;
}

export default ProtectedRoute;
