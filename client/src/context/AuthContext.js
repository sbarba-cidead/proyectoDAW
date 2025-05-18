import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Inicialmente no hay usuario

  const login = (userInfo) => setUser(userInfo);  // Método para iniciar sesión
  const logout = () => setUser(null);  // Método para cerrar sesión

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
