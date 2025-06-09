import 'styles/modals/ForumNewPostModal.css';

import { useState, useCallback } from 'react';
import AsyncCreatableSelect from 'react-select/async-creatable';
import makeAnimated from 'react-select/animated';
import NotificationMessage from 'components/page-elements/NotificationMessage';

const animatedComponents = makeAnimated();

const ForumNewPostModal = ({ user, onClose, onPostCreated }) => {
    const [title, setTitle] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [content, setContent] = useState('');
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationMessageType, setNotificationMessageType] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const apiUrl = process.env.REACT_APP_API_URL;

    // para mostrar mensaje de notificicación
    const showTempNotification = (msg, type, duration) => {
        setNotificationMessage(msg);
        setNotificationMessageType(type);
        setTimeout(() => setNotificationMessage(''), duration);
    };

    // carga las categorías para el post desde el backend
    const loadCategoryOptions = useCallback(async (inputValue) => {
        try {
            const res = await fetch(`${apiUrl}/forum/post-categories-search?search=${inputValue}`);
            const data = await res.json();
            return data.map(cat => ({
                value: cat._id,
                label: cat.name
            }));
        } catch (error) {
            console.error('Error al cargar categorías:', error);
            return [];
        }
    }, [apiUrl]);

    // manejo de creación de categorías por el usuario
    const handleCreateCategory = (inputValue) => {
        const trimmedValue = inputValue.trim();

        if (!trimmedValue) { // si sólo es espacios, no agrega la categoría
            return;
        }

        // hace trim a la categoría escrita antes de añadirla al input
        const newOption = { label: trimmedValue, value: trimmedValue };

        // agrega al array de categorías seleccionadas
        setSelectedCategories(prev => [...prev, newOption]);
    };


    // envío del formulario para la creación del post
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim() || !content.trim()) {
            showTempNotification('Por favor completa el título y el contenido del post.', 'error', 3000);
            return;
        }

        // acceso al token del usuario almacenado en local
        const token = localStorage.getItem('usertoken');
        if (!token) {
            console.error("Token de autenticación no válido.");
            return;
        }

        setIsSubmitting(true);

        // conversión del array de categorías seleccionadas a formato válido
        const categoriesFormatted = selectedCategories.map(cat => {
            // comprueba si tiene un formato válido
            const isObjectId = /^[0-9a-fA-F]{24}$/.test(cat.value);

            // si es correcto devuelve el mismo valor, o sino lo formatea
            return isObjectId ? cat.value : { name: cat.label.trim() };
        });

        // datos que se mandarán para crear el post
        const postData = {
            title: title.trim(),
            content: content.trim(),
            categories: categoriesFormatted,
            userRole: user.role,
        };

        try {
            const res = await fetch(`${apiUrl}/forum/posts/create-post`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(postData),
            });

            const data = await res.json();

            if (res.ok) {
                showTempNotification('Post creado correctamente', 'success', 2000);

                // pasado un tiempo
                setTimeout(() => { 
                    onPostCreated(data.post); // actualizar lista de posts
                    onClose(); // cerrar modal
                }, 1000);                 
            } else {
                showTempNotification('Error al crear el post.\nInténtalo de nuevo.', 'error', 2000);
                console.error(data.error);
            }
        } catch (error) {
            showTempNotification('Error al crear el post.\nInténtalo de nuevo.', 'error', 2000);
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div className="newpostmodal-background">
            {notificationMessage && 
                <NotificationMessage
                textMessage={notificationMessage}
                notificationType={notificationMessageType} />
            }
            <div className="modal-wrapper" onClick={e => e.stopPropagation()}>
                <div className="modal-content">
                    <div className="modal-header">
                        <h2>Crear nuevo post</h2>
                    </div>
                    <form className="newpost-form" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="Título del post"
                            className="title-input"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />

                        <AsyncCreatableSelect
                            components={animatedComponents}
                            isMulti
                            cacheOptions
                            defaultOptions
                            loadOptions={loadCategoryOptions}
                            formatCreateLabel={inputValue => `Agregar "${inputValue.trim()}"`}
                            onChange={setSelectedCategories}
                            onCreateOption={handleCreateCategory}
                            value={selectedCategories}
                            placeholder="Escribe o selecciona categorías... (opcional)"
                            className="categories-select"
                            classNamePrefix="select"
                        />

                        <textarea
                            placeholder="Escribe aquí el contenido del post..."
                            className="content-textarea"
                            rows="6"
                            value={content}
                            onChange={e => setContent(e.target.value)}
                        />

                        <div className="newpost-form-actions">
                            <button
                                className="cancel-post-response-btn"
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </button>
                            <button
                                className="submit-post-response-btn"
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Creando...' : 'Crear post'}
                            </button>                            
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForumNewPostModal;
