import '../styles/ForumPostModal.css';

import { useState, useEffect, useRef, useContext, Fragment } from 'react';
import { format, toZonedTime } from 'date-fns-tz';
import { useUserContext } from '../context/UserContext';

const ForumPostModal = ({ post, onClose }) => {
    const { user } = useUserContext();
    const [repliesVisible, setRepliesVisible] = useState(false);
    const [replies, setReplies] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [order, setOrder] = useState('asc');
    const [showPostReplyForm, setShowPostReplyForm] = useState(false);
    const [showCommentReplyForm, setShowCommentReplyForm] = useState(false);
    const [replyFormVisibleForComment, setReplyFormVisibleForComment] = useState(null); // id del comentario al que se está respondiendo
    const [newReplyText, setNewReplyText] = useState('');
    const scrollRefs = useRef({}); // referencia a comentario/respuesta
    const scrollContainerRef = useRef(null); // referencia general al modal
    const apiUrl = process.env.REACT_APP_API_URL;


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
            const response = await fetch(`${apiUrl}/forum/forum-posts/${post._id}/replies?page=${pageToLoad}`);
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

    // hace scroll hacia el mensaje al que hacía referencia la respuesta
    const handleScrollTo = async (id) => {
        const tryScroll = () => {
            const el = scrollRefs.current[id];
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return true;
            }
            return false;
        };

        // intentar hacer scroll directamente si ya está visible
        if (tryScroll()) return;

        // si no está visible, cargar más respuestas hasta encontrarlo
        for (let nextPage = page + 1; nextPage <= totalPages; nextPage++) {
            await fetchReplies(nextPage);
            await new Promise(resolve => setTimeout(resolve, 100)); // espera un poco por si aún no ha renderizado

            if (tryScroll()) return;
        }
    };

    // enviar nueva respuesta a post
    const handlePostSubmit = async (postContent) => {
        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: 'Nuevo Post',
                    content: postContent,
                    createdBy: "userId",  // El ID del usuario logueado
                    categories: ['Reciclaje'],
                    type: 'post',
                }),
            });

            const newPost = await response.json();
            console.log('Post creado:', newPost);
        } catch (error) {
            console.error('Error creando el post:', error);
        }
    };

    // enviar nueva respuesta a otra respuesta
    const handleCommentSubmit = async (commentContent, postId) => {
        try {
            const response = await fetch(`/api/posts/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: commentContent,
                    createdBy: "userId",  // El ID del usuario logueado
                    postId,
                }),
            });

            const newComment = await response.json();
            console.log('Comentario creado:', newComment);
        } catch (error) {
            console.error('Error creando el comentario:', error);
        }
    };

    // convertir fecha/hora de UTC a hora España península
    // y darle formato adecuado de salida
    const convertUTCDateTime = (datetimeUTC) => {
        const spanishZone = 'Europe/Madrid';

        const datetimeLocal = toZonedTime(datetimeUTC, spanishZone);
        return format(datetimeLocal, 'dd/MM/yyyy HH:mm', { timeZone: spanishZone });
    }
    

    return (
        <div className="postmodal-background" onClick={onClose}>
            <div className="modal-wrapper" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <button className="close-btn" onClick={onClose}>✖</button>
                </div>
                <div className="modal-content" ref={scrollContainerRef}>
                    <div ref={el => scrollRefs.current['post'] = el} className="post-content">          
                        <p className="post-metainfo">Por <span className="username">{post.createdBy?.fullname || 'usuario eliminado'}</span> el <span className="date">{convertUTCDateTime(post.createdAt)}</span></p>
                        <h2 className="post-content-title">{post.title}</h2>
                        <div className='post-content-text'>
                            {post.content.split('\\n').map((para, idx) => (
                                <p key={idx}>{para}</p>
                            ))}
                        </div>
                        {user && !showPostReplyForm && (
                            <button className="post-reply-btn" onClick={() => setShowPostReplyForm(true)}>Responder al post</button>
                        )}
                        {showPostReplyForm && (
                            <div className="reply-form">
                                <textarea placeholder="Tu respuesta al post..." rows="4" />
                                <div className="reply-form-actions">
                                    <button className="submit-post-response-btn" onClick={() => setShowPostReplyForm(false)}>Enviar</button>
                                    <button className="cancel-post-response-btn" onClick={() => setShowPostReplyForm(false)}>Cancelar</button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="replies-header">
                        <h3>Respuestas ({post.replies.length})</h3>
                        <select value={order} onChange={(e) => setOrder(e.target.value)}>
                            <option value="asc">Más antiguas primero</option>
                            <option value="desc">Más recientes primero</option>
                        </select>
                    </div>

                    {post.replies.length > 0 ? (
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
                                                <div key={reply._id} ref={el => scrollRefs.current[reply.id] = el} className="reply">
                                                    <p className="reply-metainfo">
                                                        <span className="username">
                                                            {reply.user?.fullname || 'usuario eliminado'}
                                                            {' '}
                                                            {reply.user?._id === post.createdBy._id ? '(creador)' : ''}
                                                        </span>
                                                        {' '}el{' '}
                                                        <span className="date">{convertUTCDateTime(reply.createdAt)}</span>
                                                    </p>
                                                    {reply.responseTo && (
                                                        <p className="reply-reference">
                                                            ↪ Respuesta a{' '}
                                                            <button onClick={() => handleScrollTo(reply.responseTo)}>comentario #{reply.responseTo}</button>
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
                                                            <textarea placeholder={`Tu respuesta a ${reply.user?.fullname || 'el comentario'}...`} rows="4" />
                                                            <div className="reply-form-actions">
                                                                <button className="submit-post-response-btn">Enviar</button>
                                                                <button className="cancel-post-response-btn" 
                                                                    onClick={() => { setReplyFormVisibleForComment(null); setShowCommentReplyForm(false); }}>
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
                            <div className="load-replies">
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
