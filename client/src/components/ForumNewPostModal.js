import '../styles/ForumNewPostModal.css';

import { useState } from 'react';
import { useUserContext } from '../context/UserContext';

const ForumNewPostModal = ({ onClose, onPostCreated }) => {
    const { user } = useUserContext();
    const [title, setTitle] = useState('');
    const [categories, setCategories] = useState([]);
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) {
            alert("Por favor completa el título y el contenido del post.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/forum/forum-posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    content,
                    categories,
                    createdBy: user?._id,
                }),
            });

            const newPost = await response.json();
            console.log('Post creado:', newPost);
            if (onPostCreated) onPostCreated(newPost);
            onClose();
        } catch (error) {
            console.error('Error al crear el post:', error);
            alert("Hubo un error al crear el post.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCategoryChange = (e) => {
        const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
        setCategories(selected);
    };

    return (
        <div className="postmodal-background" onClick={onClose}>
            <div className="modal-wrapper" onClick={e => e.stopPropagation()}>
                <div className="modal-content">
                    <div className="modal-header">
                        <button className="close-btn" onClick={onClose}>✖</button>
                    </div>

                    <h2>Crear nuevo post</h2>

                    <div className="reply-form">
                        <input
                            type="text"
                            placeholder="Título del post"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            style={{ width: '100%', marginBottom: '10px', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                        />

                        <select
                            multiple
                            value={categories}
                            onChange={handleCategoryChange}
                            style={{ width: '100%', marginBottom: '10px', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                        >
                            <option value="Reciclaje">Reciclaje</option>
                            <option value="Comunidad">Comunidad</option>
                            <option value="Educación">Educación</option>
                            <option value="Ideas">Ideas</option>
                        </select>

                        <textarea
                            placeholder="Escribe aquí el contenido principal del post..."
                            rows="6"
                            value={content}
                            onChange={e => setContent(e.target.value)}
                        />

                        <div className="reply-form-actions">
                            <button
                                className="submit-post-response-btn"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Creando...' : 'Crear post'}
                            </button>
                            <button
                                className="cancel-post-response-btn"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForumNewPostModal;
