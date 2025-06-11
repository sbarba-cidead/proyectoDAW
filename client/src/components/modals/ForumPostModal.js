import 'styles/modals/ForumPostModal.css';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUserContext } from 'context/UserContext';
import { convertUTCDateTime } from 'utils/functions';
import NotificationMessage from 'components/page-elements/NotificationMessage';
import { sendRecyclingActivity } from 'utils/functions';
import UserCardTooltip from 'components/page-elements/UserCardTooltip';
import { FaBan, FaTrashAlt } from 'react-icons/fa';
import ConfirmDialog, { confirm } from 'components/page-elements/ConfirmDialog';

const ForumPostModal = ({ post, onClose, setlastRepliedPost }) => {
    const { user } = useUserContext();
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


        // carga de respuestas al post mediante paginación
    const fetchReplies = useCallback(async (pageToLoad = 1) => {
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
    }, [apiUrl, post._id]);

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
    }, [replyIdToScroll, fetchReplies, totalPages]);

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

    // guarda el estado de visualización del post por si se recarga la página
    useEffect(() => {
        if (repliesVisible) {
            const savedState = {
                visible: true,
                page,
            };
            sessionStorage.setItem(`forum_post_${post._id}_state`, JSON.stringify(savedState));
        }
    }, [repliesVisible, page, post._id]);

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
    }, [post._id, fetchReplies]);

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
    const handleRecyclingActivity = async (commentId) =>{
        if (!user || user.banned) { return; } // si no hay usuario iniciado o está baneado no guarda la actividad

        try {
            await sendRecyclingActivity('Participar en la Comunidad de Sostenibilidad', commentId);
        } catch (error) {
            console.error('Error registrando actividad de reciclaje:', error.message);
        }
    }  

    // recupera y devuelve una lista con las respuestas al post
    const fetchRepliesList = async (pageToLoad = 1) => {
        try {
            const response = await fetch(`${apiUrl}/forum/posts/${post._id}/replies?page=${pageToLoad}`);
            const data = await response.json();

            return data.replies; // devolver directamente la lista
        } catch (error) {
            console.error('Error obteniendo respuestas:', error);
            return [];
        }
    };

    const fetchRepliesPageInfo = async () => {
        try {
            const response = await fetch(`${apiUrl}/forum/posts/${post._id}/replies?page=1`);
            const data = await response.json();
            return data.totalPages || 1;
        } catch (err) {
            console.error('Error obteniendo información de páginas:', err);
            return 1;
        }
    };


    // envío de respuestas al post
    const handlePostReplySubmit = async (postReplyText) => {
        try {
            if (!postReplyText.trim()) {
                showTempNotification('El texto de la respuesta no puede estar vacío.', 'error', 3000);
                return;
            }

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
                return;
            }

            // Asegura que las respuestas están visibles
            if (!repliesVisible) {
                setRepliesVisible(true);
            }

            // Limpia el formulario
            setNewPostReplayText('');
            setShowPostReplyForm(false);

            // Actualiza el contador
            setReplyCount(prev => prev + 1);

            // Guarda actividad
            handleRecyclingActivity(data.comment._id);
            setlastRepliedPost && setlastRepliedPost(post._id);

            // Espera un poco antes de iniciar la búsqueda y scroll
            setTimeout(async () => {
                let found = false;
                let allReplies = [];

                // 1. Obtener el total de páginas actualizado (con la nueva respuesta incluida)
                const updatedTotalPages = await fetchRepliesPageInfo();

                for (let p = 1; p <= updatedTotalPages; p++) {
                    const pageReplies = await fetchRepliesList(p);
                    allReplies.push(...pageReplies);
                    setReplies([...allReplies]); // actualiza el estado progresivamente
                    setPage(p);

                    // Espera al render
                    await new Promise(r => setTimeout(r, 100));

                    const el = scrollRefs.current[data.comment._id];
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    setTimeout(() => {
                        const el = scrollRefs.current[data.comment._id];
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                }
            }, 150);

        } catch (error) {
            console.error('Error creando el comentario:', error);
            showTempNotification('Error al enviar el comentario.\nInténtalo de nuevo.', 'error', 2000);
        } finally {
            setIsSubmitting(false);
        }
    };

    // envío de respuestas a otras respuestas
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

            // Limpia el formulario
            setNewCommentReplyText('');
            setShowCommentReplyForm(false);
            setReplyFormVisibleForComment(null);

            // Asegura visibilidad de respuestas
            if (!repliesVisible) setRepliesVisible(true);

            // Guarda actividad
            handleRecyclingActivity(data.reply._id);
            setReplyCount(prev => prev + 1);

            // Espera antes de cargar y hacer scroll
            setTimeout(async () => {
                let found = false;
                let allReplies = [];

                const updatedTotalPages = await fetchRepliesPageInfo();

                for (let p = 1; p <= updatedTotalPages; p++) {
                    const pageReplies = await fetchRepliesList(p);
                    allReplies.push(...pageReplies);
                    setReplies([...allReplies]); // Actualiza progresivamente
                    setPage(p);

                    await new Promise(r => setTimeout(r, 100));

                    const el = scrollRefs.current[data.reply._id];
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    setTimeout(() => {
                        const el = scrollRefs.current[data.reply._id];
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                }

            }, 150);

        } catch (error) {
            console.error('Error creando la respuesta:', error);
            showTempNotification('Error al enviar la respuesta.\nInténtalo de nuevo.', 'error', 2000);
        } finally {
            setIsSubmitting(false);
        }
    };

    // creación de id temporal para las respuestas (usado para referencias en front)
    const tempIdMap = {};
        sortedReplies.forEach((r, index) => {
        tempIdMap[r._id] = index + 1;
    });

    // (sólo admin) banea el comentario, ocultando su texto
    const handleBanComment = async (commentId, currentStatus) => {
        console.log("comprobacion")
        const action = currentStatus ? 'desbanear' : 'banear';
        const confirmAnswer = await confirm(`Se va a ${action} este comentario. ¿Continuar?`);
        if (!confirmAnswer) return;
    
        try {
            const res = await fetch(`${apiUrl}/forum/comments/${commentId}/visibility`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ banned: !currentStatus }),
            });
    
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Error actualizando la visibilidad');
            }
    
            showTempNotification(`Se ha completado el cambio de estado del comentario.`, 'success', 3000);
    
            setReplies(prevReplies =>
                prevReplies.map(r =>
                r._id === commentId ? { ...r, banned: !currentStatus } : r
            ));
        } catch (error) {      
            showTempNotification(`No se pudo ${action} el comentario.\nInténtalo de nuevo.`, 'error', 3000);
    
            console.error('Error al actualizar visibilidad del comentario:', error);
        }
    }

    // (sólo admin) borra un post
    const handleDeleteComment = async (commentId) => {
        const confirmAnswer = await confirm("Esta acción borrará por completo el comentario y no puede deshacerse. ¿Continuar?");
        if (!confirmAnswer) return;
    
        try {
            const res = await fetch(`${apiUrl}/forum/comments/${commentId}`, {
                method: 'DELETE',
            });
    
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Error borrando el comentario');
            }
    
            showTempNotification('El comentario se ha eliminado.', 'success', 2000);
    
            // actualiza el estado local de comentarios eliminando el comentario
            setReplies(prevReplies => prevReplies.filter(r => r._id !== commentId));
            setReplyCount(prev => prev-1);
        } catch (error) {      
            showTempNotification('No se pudo borrar el comentario.\nInténtalo de nuevo.', 'error', 2000);
            console.error('Error al borrar el comentario:', error);
        }
    }
    

    return (
        <div className="postmodal-background">
            {notificationMessage && 
                <NotificationMessage
                textMessage={notificationMessage}
                notificationType={notificationMessageType} />
            }
            <ConfirmDialog />
            <div className="modal-wrapper" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <button className="close-btn" onClick={onClose}>✖</button>
                </div>
                <div className={`modal-content ${post.banned ? 'banned' : ''}`} ref={scrollContainerRef}>
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
                                    levelIcon={post.createdBy.level?.icon}
                                    levelText={post.createdBy.level?.text}
                                    levelColor={post.createdBy.level?.color}
                                    userRole={post.createdBy.role}
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
                        <h2 className="post-content-title">{post.banned ? 'Publicación baneada por un administrador' : post.title}</h2>
                        <div className='post-content-text'>
                            {post.banned ? 
                                'El contenido no puede mostrarse porque la publicación fue baneada por un administrador.' :
                                post.content.split('\\n').map((para, idx) => (
                                    <p key={idx}>{para}</p>
                                ))
                            }
                        </div>
                        {user && !showPostReplyForm && !post.banned && (
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
                        {replyCount !== 0 && (
                            <select value={order} onChange={(e) => setOrder(e.target.value)}>
                                <option value="asc">Más antiguas primero</option>
                                <option value="desc">Más recientes primero</option>
                            </select>
                        )}
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
                                                <div key={reply._id} ref={el => scrollRefs.current[reply._id] = el} className={`reply ${reply.banned ? 'banned' : ''}`}>
                                                    <div className="reply-metainfo">
                                                        <span className="username">
                                                            <UserCardTooltip
                                                                avatar={`${avatarsUrl}/${reply.user?.avatar}`}
                                                                fullname={reply.user?.fullname}
                                                                username={reply.user?.username}
                                                                levelIcon={reply.user?.level?.icon}
                                                                levelText={reply.user?.level?.text}
                                                                levelColor={reply.user?.level?.color}
                                                                userRole={reply.user.role}
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
                                                    <p className="reply-text">{reply.banned ? 'Este comentario ha sido baneado por un administrador.' : reply.text}</p>

                                                    {user && replyFormVisibleForComment !== reply._id && (
                                                        <div className="comment-reply-container">
                                                            {user.role === 'admin' && (
                                                                <div className="admin-actions-container">
                                                                    <div className="admin-actions-bg">
                                                                    <button 
                                                                        title="Banear comentario" 
                                                                        className="icon-button ban-btn" 
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleBanComment(reply._id, reply.banned);
                                                                        }}
                                                                    >
                                                                        <FaBan />
                                                                    </button>
                                                                    <button 
                                                                        title="Eliminar comentario"
                                                                        className="icon-button delete-btn" 
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDeleteComment(reply._id);
                                                                        }}
                                                                    >
                                                                        <FaTrashAlt />
                                                                    </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {!reply.banned && (
                                                                <button className="comment-reply-btn" 
                                                                    onClick={() => { setReplyFormVisibleForComment(reply._id); setShowCommentReplyForm(true);} }>
                                                                    <span className="arrow">↪</span> Responder
                                                                </button>
                                                            )}
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
