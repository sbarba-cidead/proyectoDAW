import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

// contexto global para el inicio de sesión de usuario //

// creación del contexto
const UserContext = createContext();

// provider para el contexto
export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isUserChangingState, setIsUserChangingState] = useState(true);
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL;
    const avatarsUrl = process.env.REACT_APP_AVATAR_IMAGES_URL;

    useEffect(() => {
        // comprobación de usuario iniciado cuando se reinicia cualquier página
        const checkUser = async () => {
            setIsUserChangingState(true);

            // acceso al token del usuario almacenado en local
            const token = localStorage.getItem('usertoken');

            if (token) { // si se encuentra token
                try {
                    // solicitud al backend para comprobar el token
                    const response = await fetch(`${apiUrl}/user/me`, {
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
                            avatar: `${avatarsUrl}/${data.avatar}`,
                            role: data.role,
                            banned: data.banned,
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

            setIsUserChangingState(false);
        };

        checkUser();
    }, []);

    const logoutUser = (location) => {
        setIsUserChangingState(true);
        
        localStorage.removeItem('usertoken');
        setUser(null);

        if (location === '/perfil-usuario') {
            navigate('/');
        }
        
        setTimeout(() => { setIsUserChangingState(false); }, 100);
    };

    return (
        <UserContext.Provider value={{ user, setUserGlobalContext: setUser, isUserChangingState, logoutUser }}>
            {children}
        </UserContext.Provider>
    );
}

// hook para el contexto
export const useUserContext = () => useContext(UserContext);
