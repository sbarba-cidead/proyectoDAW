import { createContext, useState, useEffect, useContext } from 'react';
const baseUrl = process.env.REACT_APP_API_URL;

// contexto global para el inicio de sesión de usuario //

// creación del contexto
const UserContext = createContext();

// provider para el contexto
export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
        // acceso al token del usuario almacenado en local
        const token = localStorage.getItem('usertoken');

        if (token) { // si se encuentra token
            try {
                // solicitud al backend para comprobar el token
                const response = await fetch('http://localhost:5000/api/user/me', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.ok) { // si el token es correcto
                    // solicitud de datos de usuario
                    const data = await response.json();

                    // datos de usuario recibidos se almacenan en contexto
                    setUser({
                        username: data.username,
                        avatar: `${baseUrl}${data.avatar}`,
                    });
                } else { // token incorrecto o expirado
                    // elimina el token del local
                    localStorage.removeItem('usertoken');

                    // resetea los datos de usuario en contexto
                    setUser(null);
                }
            } catch (error) {
                console.error('Error verificando token:', error);

                // resetea los datos de usuario en contexto
                setUser(null);
            }
        }

        setIsLoadingUser(false);
    };

    checkUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUserGlobalContext: setUser, isLoadingUser }}>
        {children}
    </UserContext.Provider>
  );
}

// hook para el contexto
export const useUserContext = () => useContext(UserContext);
