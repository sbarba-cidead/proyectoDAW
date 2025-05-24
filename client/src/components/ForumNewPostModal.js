import '../styles/ForumNewPostModal.css';

import { useState, useCallback } from 'react';
import AsyncCreatableSelect from 'react-select/async-creatable';
import makeAnimated from 'react-select/animated';

const animatedComponents = makeAnimated();

const ForumNewPostModal = ({ onClose, onPostCreated }) => {
    const [title, setTitle] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const apiUrl = process.env.REACT_APP_API_URL;

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

    // envío del formulario para la creación del post
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim() || !content.trim()) {
            alert("Por favor completa el título y el contenido del post.");
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
            return isObjectId ? cat.value : { name: cat.label };
        });

        // datos que se mandarán para crear el post
        const postData = {
            title,
            content,
            categories: categoriesFormatted,
        };

        try {
            const res = await fetch(`${apiUrl}/forum/create-post`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(postData),
            });

            const data = await res.json();

            if (res.ok) {
                alert('Post creado correctamente');
                onPostCreated(data.post); // función para actualizar lista o cerrar modal
                onClose();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            alert('Error al enviar la petición');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // const handleSubmit = async () => {
    //     if (!title.trim() || !content.trim()) {
    //         alert("Por favor completa el título y el contenido del post.");
    //         return;
    //     }

    //     setIsSubmitting(true);

    //     try {
    //         const response = await fetch(`${process.env.REACT_APP_API_URL}/forum/forum-posts`, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({
    //                 title,
    //                 content,
    //                 categories,
    //                 createdBy: user?._id,
    //             }),
    //         });

    //         const newPost = await response.json();
    //         console.log('Post creado:', newPost);
    //         if (onPostCreated) onPostCreated(newPost);
    //         onClose();
    //     } catch (error) {
    //         console.error('Error al crear el post:', error);
    //         alert("Hubo un error al crear el post.");
    //     } finally {
    //         setIsSubmitting(false);
    //     }
    // };

    // -----------

    // const handleCategoryChange = (e) => {
    //     const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
    //     setSelectedCategories(selected);
    // };

    // const animatedComponents = makeAnimated();


    return (
        <div className="postmodal-background" onClick={onClose}>
            <div className="modal-wrapper" onClick={e => e.stopPropagation()}>
                <div className="modal-content">
                    <div className="modal-header">
                        <button className="close-btn" onClick={onClose}>✖</button>
                    </div>

                    <h2>Crear nuevo post</h2>

                    <form className="reply-form" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="Título del post"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            style={{ width: '100%', marginBottom: '10px', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                        />

                        <AsyncCreatableSelect
                            components={animatedComponents}
                            isMulti
                            cacheOptions
                            defaultOptions
                            loadOptions={loadCategoryOptions}
                            formatCreateLabel={inputValue => `Agregar "${inputValue}"`}
                            onChange={setSelectedCategories}
                            value={selectedCategories}
                            placeholder="Escribe o selecciona categorías..."
                        />

                        <textarea
                            placeholder="Escribe aquí el contenido principal del post..."
                            rows="6"
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            style={{ width: '100%', marginTop: '10px', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                        />

                        <div className="reply-form-actions">
                            <button
                                className="submit-post-response-btn"
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Creando...' : 'Crear post'}
                            </button>
                            <button
                                className="cancel-post-response-btn"
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForumNewPostModal;
