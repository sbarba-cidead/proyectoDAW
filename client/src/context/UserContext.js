import { createContext, useState, useEffect, useContext } from 'react';

// contexto global para el inicio de sesión de usuario //

// creación del contexto
const UserContext = createContext();

// acceso al token del usuario almacenado en local
const token = localStorage.getItem('usertoken');

// provider para el contexto
export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const apiUrl = process.env.REACT_APP_API_URL;

    useEffect(() => {
       if (user){ console.log("usercontext recibido de login", user.avatar)}
        const checkUser = async () => {
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
                            avatar: data.avatar, // url completa a la imagen del avatar
                        });

                        console.log("usercontext fetch", user.avatar)
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

    // función de recarga del usuario
    const refreshUser = async () => {
        if (!token) return;

        try {
            const response = await fetch(`${apiUrl}/user/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
            });

            if (response.ok) {
            const data = await response.json();
            setUser({
                ...data,
            });
            }
        } catch (error) {
            console.error('Error refrescando usuario:', error);
        }
    };

    return (
        <UserContext.Provider value={{ user, setUserGlobalContext: setUser, isLoadingUser, refreshUser }}>
            {children}
        </UserContext.Provider>
    );
}

// hook para el contexto
export const useUserContext = () => useContext(UserContext);
