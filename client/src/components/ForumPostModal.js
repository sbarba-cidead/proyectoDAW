import '../styles/ForumPostModal.css';

import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';
import { convertUTCDateTime } from '../utils/functions';
import NotificationMessage from './NotificationMessage';
import { sendRecyclingActivity } from '../utils/functions';
import UserCardTooltip from './UserCardTooltip';

const ForumPostModal = ({ post, onClose, setlastRepliedPost }) => {
    const { user, refreshUser } = useUserContext();
    const [repliesVisible, setRepliesVisible] = useState(false);
    const [replies, setReplies] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [order, setOrder] = useState('asc');
    const [replyCount, setReplyCount] = useState(post.replies.length);
    const [showPostReplyForm, setShowPostReplyForm] = useState(false);
    const [showCommentReplyForm, setShowCommentReplyForm] = useState(false);
    const [replyFormVisibleForComment, setReplyFormVisibleForComment] = useState(null); // id del comentario al que se está respondiendo
    const [newCommentReplyText, setNewCommentReplyText] = useState('');
    const [newPostReplayText, setNewPostReplayText] = useState('')
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationMessageType, setNotificationMessageType] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const scrollRefs = useRef({}); // referencia a comentario/respuesta
    const scrollContainerRef = useRef(null); // referencia general al modal
    const location = useLocation();
    const apiUrl = process.env.REACT_APP_API_URL;
    const avatarsUrl = process.env.REACT_APP_AVATAR_IMAGES_URL;

    // para acceso directo por url a una respuesta de un post
    const searchParams = new URLSearchParams(location.search);
    const replyIdToScroll = searchParams.get('replyId')

    useEffect(() => {
        if (!replyIdToScroll) return;

        const loadAndScroll = async () => {
            setRepliesVisible(true);
            await fetchReplies(1);
            for (let p = 2; p <= totalPages; p++) {
            await fetchReplies(p);
            }
            setTimeout(() => tryScrollTo(replyIdToScroll), 200);
        };

        loadAndScroll();
    }, [replyIdToScroll]);

    // detecta y enlaza la referencia para el scroll del modal,
    // la posición se almacena como dato de sesión para mantenerla tras la recarga de la página
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            sessionStorage.setItem(`forum_post_${post._id}_scrollTop`, container.scrollTop);
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [post._id]);

    // carga de respuestas al post mediante paginación
    const fetchReplies = async (pageToLoad = 1) => {
        try {
            const response = await fetch(`${apiUrl}/forum/posts/${post._id}/replies?page=${pageToLoad}`);
            const data = await response.json();

            // añade las respuestas a las anteriores si ya hay
            if (pageToLoad > 1) {
                setReplies(prev => [...prev, ...data.replies]);
            } else {
                setReplies(data.replies);
            }

            setTotalPages(data.totalPages);
            setPage(pageToLoad);
        } catch (error) {
            console.error('Error obteniendo respuestas:', error);
        }
    };

    // guarda el estado de visualización del post por si se recarga la página
    useEffect(() => {
        if (repliesVisible) {
            const savedState = {
                visible: true,
                page,
            };
            sessionStorage.setItem(`forum_post_${post._id}_state`, JSON.stringify(savedState));
        }
    }, [repliesVisible, page]);

    // recuperación de datos guardados de visualización del post al recargar la página
    useEffect(() => {
        const restoreState = async () => {
            const saved = sessionStorage.getItem(`forum_post_${post._id}_state`); // estado del post
            const savedScrollTop = sessionStorage.getItem(`forum_post_${post._id}_scrollTop`); // scroll del post

            if (saved) {
                const { visible, page: savedPage } = JSON.parse(saved);
                if (visible) { // si se estaban visualiando respuestas, las carga
                    setRepliesVisible(true);
                    await fetchReplies(1);

                    // carga exactamente el número de respuestas que se estaban visualizando
                    for (let p = 2; p <= savedPage; p++) { 
                        await fetchReplies(p);
                    }

                    setPage(savedPage); // actualiza la paginación

                    // espera a que se renderice el contenido
                    setTimeout(() => {
                        if (savedScrollTop && scrollContainerRef.current) {
                            // mueve el scroll a la posición que se estaba visualizando
                            scrollContainerRef.current.scrollTop = parseInt(savedScrollTop, 10);
                        }
                    }, 100);
                }
            }
        };
        restoreState();
    }, [post._id]);

    // ordenar las respuestas al post
    const sortedReplies = [...replies].sort((a, b) => {
        return order === 'asc'
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt);
    });

    // scroll simple a una respuesta
    const tryScrollTo = (id) => {
        const el = scrollRefs.current[id];
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return true;
        }
        return false;
    };

    // hace scroll hacia el mensaje al que hacía referencia la respuesta
    const handleScrollTo = async (id) => {
        tryScrollTo(id);

        // intentar hacer scroll directamente si ya está visible
        if (tryScrollTo(id)) return;

        // si no está visible, cargar más respuestas hasta encontrarlo
        for (let nextPage = page + 1; nextPage <= totalPages; nextPage++) {
            await fetchReplies(nextPage);
            await new Promise(resolve => setTimeout(resolve, 100)); // espera un poco por si aún no ha renderizado

            if (tryScrollTo(id)) return;
        }
    };

    // para mostrar mensaje de notificicación
    const showTempNotification = (msg, type, duration) => {
        setNotificationMessage(msg);
        setNotificationMessageType(type);
        setTimeout(() => setNotificationMessage(''), duration);
    };

    // función para guardar una nueva actividad de reciclaje
    const handleRecyclingActivity = async () =>{
        if (!user) { return; } // si no hay usuario iniciado no guarda la actividad

        try {
            await sendRecyclingActivity('Participar en la Comunidad de Sostenibilidad');
            await refreshUser(); // recarga los datos del usuario en contexto global
        } catch (error) {
            console.error('Error registrando actividad de reciclaje:', error.message);
        }
    }  

    // enviar nueva respuesta a post
    const handlePostReplySubmit = async (postReplyText) => {
        try {
            if (!postReplyText.trim()) {
                showTempNotification('El texto de la respuesta no puede estar vacío.', 'error', 3000);
                return;
            }

            // acceso al token del usuario almacenado en local
            const token = localStorage.getItem('usertoken');
            if (!token) {
                console.error("Token de autenticación no válido.");
                return;
            }

            setIsSubmitting(true);

            const response = await fetch(`${apiUrl}/forum/posts/${post._id}/create-comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ text: postReplyText.trim() }),
            });

            const data = await response.json();

            if (!response.ok) {
                showTempNotification('Error al enviar el comentario.\nInténtalo de nuevo.', 'error', 3000);
                console.error(data.error);
            }

            // añade la nueva respuesta a la lista para que se 
            // recargen las respuestas al post
            setReplies(prev => [...prev, data.comment]);
            // aumenta número de respuestas
            setReplyCount(prev => prev + 1);

            // limpia el formulario
            setNewPostReplayText(''); // limpia el formulario
            setShowPostReplyForm(false); // oculta el forumario          

            // se añade actividad de reciclaje
            handleRecyclingActivity();

            // si no estaba activada la visualización de respuestas, la activa
            if (!repliesVisible) { setRepliesVisible(true); }

            setlastRepliedPost && setlastRepliedPost(post._id);
            
            setTimeout(() => { // pasado un tiempo
                // scroll hacia el nuevo comentario
                const el = scrollRefs.current[data.comment._id];
                if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
            }, 100);    
        } catch (error) {
            console.error('Error creando el comentario:', error);
            showTempNotification('Error al enviar el comentario.\nInténtalo de nuevo.', 'error', 2000);
        } finally {
            setIsSubmitting(false);
        }
    };

    // enviar nueva respuesta a otra respuesta
    const handleCommentReplySubmit = async (commentContent, postId, responseToId) => {
        try {
            if (!commentContent.trim()) {
                showTempNotification('El texto de la respuesta no puede estar vacío.', 'error', 3000);
                return;
            }

            const token = localStorage.getItem('usertoken');
            if (!token) {
                console.error("Token de autenticación no válido.");
                return;
            }

            setIsSubmitting(true);

            const response = await fetch(`${apiUrl}/forum/comments/${responseToId}/create-comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    text: commentContent.trim(), 
                    postId: postId 
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                showTempNotification('Error al enviar la respuesta.\nInténtalo de nuevo.', 'error', 3000);
                console.error(data.error);
                return;
            }

            // añade la nueva respuesta a la lista para que se 
            // recargen las respuestas al post
            setReplies(prev => [...prev, data.reply]);
            // aumenta número de respuestas
            setReplyCount(prev => prev + 1);

            // limpia el formulario
            setNewCommentReplyText(''); // limpia el formulario
            setShowCommentReplyForm(false); // oculta el forumario
            setReplyFormVisibleForComment(null);

            // si no estaba activada la visualización de respuestas, la activa
            if (!repliesVisible) setRepliesVisible(true);

            setTimeout(() => { // pasado un tiempo
                // scroll hacia la nueva respuesta
                const el = scrollRefs.current[data.reply._id];
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);

            // se añade actividad de reciclaje
            handleRecyclingActivity();
        } catch (error) {
            console.error('Error creando la respuesta:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // creación de id temporal para las respuestas (usado para referencias en front)
    const tempIdMap = {};
        sortedReplies.forEach((r, index) => {
        tempIdMap[r._id] = index + 1;
    });
    

    return (
        <div className="postmodal-background">
            {notificationMessage && 
                <NotificationMessage
                textMessage={notificationMessage}
                notificationType={notificationMessageType} />
            }
            <div className="modal-wrapper" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <button className="close-btn" onClick={onClose}>✖</button>
                </div>
                <div className="modal-content" ref={scrollContainerRef}>
                    <div ref={el => scrollRefs.current['post'] = el} className="post-content">
                        <div className="post-metainfo">
                            <div className="post-categories">
                                {Array.isArray(post.categories) && post.categories.length > 0 ? (
                                    post.categories.map((cat) => (
                                        <span key={cat._id || cat.name} className="category-tag">
                                            {cat.name}
                                        </span>
                                    ))
                                    ) : (
                                        <span className="category-tag uncategorized">Sin categorías</span>
                                )}
                            </div>                            
                            <div className="post-created-by">
                                Por
                                {' '}
                                <UserCardTooltip
                                    avatar={`${avatarsUrl}/${post.createdBy.avatar}`}
                                    fullname={post.createdBy.fullname}
                                    username={post.createdBy.username}
                                    levelIcon={post.createdBy.level.icon}
                                    levelText={post.createdBy.level.text}
                                    levelColor={post.createdBy.level.color}
                                >
                                    <Link
                                        className="created-by"
                                        to={
                                            user && post.createdBy.username === user.username
                                            ? `/perfil-usuario`
                                            : `/perfil-usuario/${post.createdBy.username}`
                                        }
                                        state={ 
                                            user && post.createdBy.username === user.username
                                            ? undefined
                                            : { userId: post.createdBy._id }
                                        }
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <span className="username">{post.createdBy?.fullname || 'usuario eliminado'}</span>
                                    </Link>
                                </UserCardTooltip>
                                {' '}
                                el <span className="date">{convertUTCDateTime(post.createdAt)}</span>
                            </div>
                        </div>
                        <h2 className="post-content-title">{post.title}</h2>
                        <div className='post-content-text'>
                            {post.content.split('\\n').map((para, idx) => (
                                <p key={idx}>{para}</p>
                            ))}
                        </div>
                        {user && !showPostReplyForm && (
                            <button className="post-reply-btn" onClick={() => setShowPostReplyForm(true)}><span className="arrow">↪</span> Responder al post</button>
                        )}
                        {showPostReplyForm && (
                            <div className="reply-form">
                                <textarea 
                                    placeholder="Tu respuesta al post..." 
                                    rows="4"
                                    value={newPostReplayText}
                                    onChange={(e) => setNewPostReplayText(e.target.value)} />
                                <div className="reply-form-actions">
                                    <button 
                                        className="submit-post-response-btn" 
                                        type="button"
                                        onClick={() => handlePostReplySubmit(newPostReplayText)}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Enviando...' : 'Enviar'}
                                    </button>
                                    <button 
                                        className="cancel-post-response-btn"
                                        type="button"
                                        onClick={() => setShowPostReplyForm(false)}
                                        disabled={isSubmitting}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="replies-header">
                        <h3>Respuestas ({replyCount})</h3>
                        <select value={order} onChange={(e) => setOrder(e.target.value)}>
                            <option value="asc">Más antiguas primero</option>
                            <option value="desc">Más recientes primero</option>
                        </select>
                    </div>

                    {replyCount > 0 ? (
                            !repliesVisible ? (
                                <div className="load-replies">
                                    <button onClick={() => { fetchReplies(1); setRepliesVisible(true);}}>
                                        - Mostrar respuestas -
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="replies-list">
                                        {[...replies]
                                            .sort((a, b) => order === 'asc'
                                                ? new Date(a.createdAt) - new Date(b.createdAt)
                                                : new Date(b.createdAt) - new Date(a.createdAt)
                                            )
                                            .map((reply) => (
                                                <div key={reply._id} ref={el => scrollRefs.current[reply._id] = el} className="reply">
                                                    <div className="reply-metainfo">
                                                        <span className="username">
                                                            <UserCardTooltip
                                                                avatar={`${avatarsUrl}/${reply.user?.avatar}`}
                                                                fullname={reply.user?.fullname}
                                                                username={reply.user?.username}
                                                                levelIcon={reply.user?.level.icon}
                                                                levelText={reply.user?.level.text}
                                                                levelColor={reply.user?.level.color}
                                                            >
                                                                <Link
                                                                    className="created-by"
                                                                    to={
                                                                        user && reply.user?.username === user.username
                                                                        ? `/perfil-usuario`
                                                                        : `/perfil-usuario/${reply.user?.username}`
                                                                    }
                                                                    state={ 
                                                                        user && reply.user?.username === user.username
                                                                        ? undefined
                                                                        : { userId: reply.user?._id }
                                                                    }
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    {reply.user?.fullname || 'usuario eliminado'}
                                                                    {reply.user?._id === post.createdBy._id ? ' (creador)' : ''}
                                                                </Link>
                                                            </UserCardTooltip>
                                                        </span>
                                                        {' '}el{' '}
                                                        <span className="date">{convertUTCDateTime(reply.createdAt)}</span>
                                                    </div>
                                                    {reply.responseTo && (
                                                        <p className="reply-reference">
                                                            ↪ Respuesta a{' '}
                                                            <button onClick={() => handleScrollTo(reply.responseTo)}>comentario #{tempIdMap[reply.responseTo] || 'mensaje eliminado'}</button>
                                                        </p>
                                                    )}
                                                    <p className="reply-text">{reply.text}</p>

                                                    {user && replyFormVisibleForComment !== reply._id && (
                                                        <div className="comment-reply-container">
                                                            <button className="comment-reply-btn" 
                                                                onClick={() => { setReplyFormVisibleForComment(reply._id); setShowCommentReplyForm(true);} }>
                                                                <span className="arrow">↪</span> Responder
                                                            </button>
                                                        </div>

                                                    )}

                                                    {showCommentReplyForm && replyFormVisibleForComment === reply._id && (
                                                        <div className="reply-form">
                                                            <textarea 
                                                                placeholder={`Tu respuesta a ${reply.user?.fullname || 'el comentario'}...`} 
                                                                rows="4"
                                                                value={newCommentReplyText}
                                                                onChange={(e) => setNewCommentReplyText(e.target.value)} />                                                                
                                                            <div className="reply-form-actions">
                                                                <button
                                                                    type="button"
                                                                    className="submit-post-response-btn"
                                                                    onClick={() => handleCommentReplySubmit(newCommentReplyText, post._id, reply._id)}
                                                                    disabled={isSubmitting}
                                                                >
                                                                    {isSubmitting ? 'Enviando...' : 'Enviar'}
                                                                </button>
                                                                <button 
                                                                    className="cancel-post-response-btn"
                                                                    type="button"
                                                                    onClick={() => { 
                                                                        setReplyFormVisibleForComment(null); 
                                                                        setShowCommentReplyForm(false); }}
                                                                    disabled={isSubmitting}
                                                                    >
                                                                    Cancelar
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        }
                                    </div>

                                    {/* botón para cargar más respuestas */}
                                    {page < totalPages && (
                                        <div className="load-more">
                                            <button onClick={() => fetchReplies(page + 1)}>- Cargar más respuestas -</button>
                                        </div>
                                    )}
                                    {page >= totalPages && replies.length > 0 && (
                                        <p className="no-more-replies">Ya no hay más respuestas.</p>
                                    )}
                                </>
                            )
                        ) : (
                            <div className="no-replies">
                                Aún no hay respuestas que mostrar.
                                {' '}
                                {user && <>Sé el primero en responder.</>}                                
                            </div>
                        )
                    }                
                </div>
            </div>
        </div>
    );
};

export default ForumPostModal;
