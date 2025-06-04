import { useUserContext } from 'context/UserContext';
import UnauthorizedPage from 'components/error-pages/UnauthorizedPage';

// impide acceso a la página de perfil de usuario
// si no hay usuario con sesión iniciada

function ProtectedRoute({ children }) {
  const { user, isUserChangingState } = useUserContext();

  if (isUserChangingState) return null;

  return user ? children : <UnauthorizedPage />;
}

export default ProtectedRoute;
