import React, { useState } from 'react';
import '../styles/Forum.css';

const Forum = () => {
  // Estado para las publicaciones y el nuevo comentario
  const [posts, setPosts] = useState([
    { id: 1, title: '¿Cómo aprender React?', content: '¿Alguien tiene consejos para comenzar con React?', comments: [] },
    { id: 2, title: 'Mejor librería para manejar el estado', content: '¿Qué librería usáis para el manejo de estado?', comments: [] }
  ]);

  const [newComment, setNewComment] = useState('');
  const [newPost, setNewPost] = useState({ title: '', content: '' });

  // Maneja el envío de nuevos comentarios
  const handleCommentSubmit = (postId) => {
    if (newComment.trim() === '') return;

    setPosts(posts.map(post => 
      post.id === postId 
      ? { ...post, comments: [...post.comments, newComment] }
      : post
    ));
    setNewComment('');
  };

  // Maneja el envío de nuevas publicaciones
  const handlePostSubmit = () => {
    if (newPost.title.trim() === '' || newPost.content.trim() === '') return;

    const newId = posts.length ? posts[posts.length - 1].id + 1 : 1;
    setPosts([...posts, { id: newId, title: newPost.title, content: newPost.content, comments: [] }]);
    setNewPost({ title: '', content: '' });
  };

  return (
    <div className="forum">
      <h1>Foro</h1>

      {/* Formulario para agregar nueva publicación */}
      <div className="new-post">
        <h2>Crear una nueva publicación</h2>
        <input
          type="text"
          placeholder="Título"
          value={newPost.title}
          onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
        />
        <textarea
          placeholder="Contenido"
          value={newPost.content}
          onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
        />
        <button onClick={handlePostSubmit}>Publicar</button>
      </div>

      {/* Mostrar publicaciones */}
      <div className="posts">
        {posts.map(post => (
          <div key={post.id} className="post">
            <h3>{post.title}</h3>
            <p>{post.content}</p>

            {/* Comentarios */}
            <div className="comments">
              <h4>Comentarios:</h4>
              {post.comments.length > 0 ? (
                <ul>
                  {post.comments.map((comment, index) => (
                    <li key={index}>{comment}</li>
                  ))}
                </ul>
              ) : (
                <p>No hay comentarios aún.</p>
              )}

              {/* Formulario para agregar comentario */}
              <textarea
                placeholder="Escribe un comentario"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button onClick={() => handleCommentSubmit(post.id)}>Comentar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Forum;
