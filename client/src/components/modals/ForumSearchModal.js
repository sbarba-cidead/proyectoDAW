import 'styles/modals/ForumSearchModal.css';

import { useState, useEffect } from 'react';
import { FaCalendar, FaCommentDots, FaComment, FaTimesCircle } from "react-icons/fa";
import NotificationMessage from 'components/page-elements/NotificationMessage';

const ForumSearchModal = ({ onClose, onSelectPost }) => {
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationMessageType, setNotificationMessageType] = useState('');
    const [query, setQuery] = useState('');
    const [liveResults, setLiveResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const apiUrl = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const fetchSuggestions = async () => {
        if (!query.trim()) {
            setLiveResults([]);
            return;
        }
        try {
            setLoading(true);
            const res = await fetch(`${apiUrl}/forum/posts/search?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            setLiveResults(data.posts || []);
        } catch (err) {
            setLiveResults([]);

            showTempNotification('Error buscando posts.\nInténtalo de nuevo.', 'error', 3000);
            console.error('Error buscando posts:', err);        
        } finally {
            setLoading(false);
        }
        };

        fetchSuggestions();
    }, [query, apiUrl]);

    // para mostrar mensaje de notificicación
    const showTempNotification = (msg, type, duration) => {
        setNotificationMessage(msg);
        setNotificationMessageType(type);
        setTimeout(() => setNotificationMessage(''), duration);
    };

    const convertUTCDateTime = (date) => {
        if (!date) return "";
        const d = new Date(date);
        return d.toLocaleString();
    };

    return (
        <div className="forum-search-modal-overlay">
            {notificationMessage && 
                <NotificationMessage
                    textMessage={notificationMessage}
                    notificationType={notificationMessageType} />
            }
            <div className="forum-search-modal-wrapper">
                <button className="close-btn" onClick={onClose} title="cerrar búsqueda">✕</button> 
                <div className="forum-search-modal">                             
                    <div className="search-input-header">
                        <div className="input-wrapper">
                            <input
                                type="text"
                                id="input-posts-search"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="Buscar posts..."
                                autoFocus
                            />
                            { query && (<FaTimesCircle  className="clear-icon"
                                onClick={() => setQuery('')} />)
                            }
                        </div>
                    </div>

                    <div className="search-input-suggestions">
                        {loading && <p className="search-loading">Buscando...</p>}

                        {query && !loading && liveResults.length === 0 && (
                            <div className="search-posts">
                                <p className="no-results-message">No se encontraron resultados para “{query}”.</p>
                            </div>
                        )}

                        {/* sugerencias de búsqueda en tiempo real */}
                        {query && liveResults.length > 0 && (
                            <div className="search-posts">
                                {liveResults.map(post => (
                                <article 
                                    className={`post ${post.banned ? "banned" : ""}`} 
                                    key={post._id}
                                    onClick={() => onSelectPost(post)}
                                >
                                    <div className="post-header">
                                        <div className="dates">
                                            <span className="created-container">
                                                <span className="date-label">Creado:</span>
                                                <span className="date">{convertUTCDateTime(post.createdAt)}</span>
                                            </span>
                                            <span className="separator">|</span>
                                            <span className="last-updated-container">
                                                <span className="date-label">Última respuesta:</span>
                                                <span className="date">{convertUTCDateTime(post.lastReplyAt)}</span>
                                            </span>
                                        </div>

                                        <div className="post-title">
                                            {post.type === "event" ? (
                                                <FaCalendar color="#FF6F00" />
                                            ) : (
                                                <FaCommentDots color="#89c26e" />
                                            )}
                                            <span className="text-container">
                                                <h3>{post.banned ? "Publicación baneada por un administrador" : post.title}</h3>
                                                <span className="category">
                                                    Categorías:{" "}
                                                    {Array.isArray(post.categories)
                                                        ? post.categories.map(c => c.name).join(", ")
                                                        : post.categories?.name || "Sin categoría"
                                                    }
                                                </span>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="post-footer">
                                        <div className="created-info">
                                            <span className="created-by-label">Creado por:</span>
                                            <span className="created-by">{post.createdBy?.fullname || "usuario eliminado"}</span>
                                        </div>

                                        <div className="spacer"></div>

                                        <div className="replies">
                                            <span className="icon">
                                                <FaComment />
                                            </span>
                                            <span>{post.replies?.length || 0}</span>
                                        </div>
                                    </div>
                                </article>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForumSearchModal;
