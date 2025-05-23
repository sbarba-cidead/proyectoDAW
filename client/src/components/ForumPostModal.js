import '../styles/ForumPostModal.css';

import { useState, useEffect, useRef, useContext } from 'react';
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
    const [newReplyText, setNewReplyText] = useState('');
    const scrollRefs = useRef({});
    const apiUrl = process.env.REACT_APP_API_URL;

    // const fetchReplies = async () => {
    //     try {
    //         const response = await fetch(`${apiUrl}/forum/forum-posts/${post._id}/replies?page=${page}`);
    //         const data = await response.json();
    //         setReplies(prevReplies => [...prevReplies, ...data.replies]);
    //         setTotalPages(data.totalPages);
    //     } catch (error) {
    //         console.error('Error obteniendo respuestas:', error);
    //     }
    // };

    // useEffect(() => {
    //     fetchReplies();
    // }, [page]);

    const fetchReplies = async (pageToLoad = 1) => {
        try {
            const response = await fetch(`${apiUrl}/forum/forum-posts/${post._id}/replies?page=${pageToLoad}`);
            const data = await response.json();

            console.log("Respuestas recibidas:", data);

            // Añadir a las anteriores si ya hay
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


    // // Obtener respuestas al post
    // useEffect(() => {
    //     const fetchReplies = async () => {
    //     try {
    //         const response = await fetch(`${apiUrl}/forum/forum-posts/${post._id}/comments`);
    //         const data = await response.json();
    //         setReplies(data);
    //     } catch (error) {
    //         console.error('Error obteniendo respuestas:', error);
    //     }
    //     };

    //     fetchReplies();
    // }, [post._id]);

    // ordenar las respuestas al post
    const sortedReplies = [...replies].sort((a, b) => {
        return order === 'asc'
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt);
    });

    // hace scroll hacia el mensaje al que hacía referencia la respuesta
    const handleScrollTo = (id) => {
        // setOriginalScroll(window.scrollY);
        setTimeout(() => {
            scrollRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 0);
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


    return (
        <div className="postmodal-background" onClick={onClose}>
            <div className="modal-wrapper" onClick={(e) => e.stopPropagation()}>
                <div className="modal-content">
                        <button className="close-btn" onClick={onClose}>✖</button>

                        <div ref={el => scrollRefs.current['post'] = el} className="post-content">
                            <h2>{post.title}</h2>
                            <p className="post-metainfo">Por <span className="username">{post.createdBy?.username || 'Anónimo'}</span> el <span className="date">{post.createdAt}</span></p>
                            <p>{post.content}</p>
                            {user && (
                                <button className="post-reply-btn" onClick={() => setShowPostReplyForm(true)}>Responder al post</button>
                            )}
                            {showPostReplyForm && (
                                <div className="reply-form">
                                    <textarea placeholder="Tu respuesta al post..." rows="4" />
                                    <div className="reply-form-actions">
                                        <button className="submit-post-response-btn">Enviar</button>
                                        <button className="cancel-post-response-btn" onClick={() => setShowPostReplyForm(false)}>Cancelar</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* <div className="replies-header">
                            <h3>Respuestas ({replies.length})</h3>
                            <select value={order} onChange={(e) => setOrder(e.target.value)}>
                                <option value="asc">Más antiguas primero</option>
                                <option value="desc">Más recientes primero</option>
                            </select>
                        </div> */}

                        {!repliesVisible ? (
                                <div className="load-replies">
                                    <button onClick={() => { fetchReplies(1); setRepliesVisible(true);}}>
                                        Mostrar respuestas
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="replies-header">
                                    <h3>Respuestas ({post.replies.length})</h3>
                                    <select value={order} onChange={(e) => setOrder(e.target.value)}>
                                        <option value="asc">Más antiguas primero</option>
                                        <option value="desc">Más recientes primero</option>
                                    </select>
                                    </div>

                                    <div className="replies-list">
                                        {[...replies]
                                            .sort((a, b) => order === 'asc'
                                                ? new Date(a.createdAt) - new Date(b.createdAt)
                                                : new Date(b.createdAt) - new Date(a.createdAt)
                                            )
                                            .map((reply) => (
                                                <div key={reply._id} ref={el => scrollRefs.current[reply._id] = el} className="reply">
                                                    <p className="reply-metainfo">
                                                        <span className="username">{reply.user?.username || 'Anónimo'}</span> el{' '}
                                                        <span className="date">{new Date(reply.createdAt).toLocaleString()}</span>
                                                    </p>
                                                    {reply.responseTo && (
                                                        <p className="reply-reference">
                                                            Respuesta a{' '}
                                                            <button onClick={() => handleScrollTo(reply.responseTo)}>comentario #{reply.responseTo}</button>
                                                        </p>
                                                    )}
                                                    <p>{reply.text}</p>

                                                    {user && (
                                                        <button className="response-reply-btn" onClick={() => setShowCommentReplyForm(true)}>
                                                            <span className="arrow">↪</span> Responder
                                                        </button>
                                                    )}

                                                    {showCommentReplyForm && (
                                                        <div className="reply-form">
                                                            <textarea placeholder={`Tu respuesta a ${reply.user?.username || 'el comentario'}...`} rows="4" />
                                                            <div className="reply-form-actions">
                                                                <button className="submit-post-response-btn">Enviar</button>
                                                                <button className="cancel-post-response-btn" onClick={() => setShowCommentReplyForm(false)}>
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
                                            <button onClick={() => fetchReplies(page + 1)}>Cargar más respuestas</button>
                                        </div>
                                    )}
                                    {page >= totalPages && replies.length > 0 && (
                                        <p className="no-more-replies">Ya no hay más respuestas.</p>
                                    )}
                                </>
                            )
                        }


                        {/* <div className="replies-list">
                            {sortedReplies.map((reply) => (
                                <div key={reply.id} ref={el => scrollRefs.current[reply.id] = el} className="reply">
                                    <p className="reply-metainfo">
                                        <span className="username">{reply.user}</span> el <span className="date">{new Date(reply.createdAt).toLocaleString()}</span>
                                    </p>
                                    {reply.responseTo && (
                                        <p className="reply-reference">
                                        Respuesta a <button onClick={() => handleScrollTo(reply.responseTo)}>comentario #{reply.responseTo}</button>
                                        </p>
                                    )}
                                    <p>{reply.text}</p>

                                    {user && (
                                        <button className="response-reply-btn" onClick={() => setShowCommentReplyForm(true)}>
                                            <span className="arrow">↪</span> Responder
                                        </button>
                                    )}

                                    {showCommentReplyForm && (
                                        <div className="reply-form">
                                        <textarea placeholder={`Tu respuesta a ${reply.user}...`} rows="4" />
                                        <div className="reply-form-actions">
                                            <button className="submit-post-response-btn">Enviar</button>
                                            <button className="cancel-post-response-btn" onClick={() => setShowCommentReplyForm(false)}>Cancelar</button>
                                        </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div> */}
                
                </div>
            </div>
        </div>
    );
};

export default ForumPostModal;
