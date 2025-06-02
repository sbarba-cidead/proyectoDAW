import 'styles/pages/ForumPage.css';

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaCalendar, FaComment, FaCommentDots } from 'react-icons/fa';
import { useUserContext } from 'context/UserContext';
import ForumPostModal from 'components/modals/ForumPostModal';
import ForumNewPostModal from 'components/modals/ForumNewPostModal';
import UserCardTooltip from 'components/page-elements/UserCardTooltip';
import { convertUTCDateTime, sendRecyclingActivity } from 'utils/functions';
import NotificationMessage from 'components/page-elements/NotificationMessage';

const ForumPage = () => {
  const numberPostShown = 5
  const numberPostLoad = 3

  const { postId } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useUserContext();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(numberPostShown);
  const [orderBy, setOrderBy] = useState('latest');
  const [availableCategories, setAvailableCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPostsAvailable, setNewPostsAvailable] = useState(false);
  const [lastRepliedPost, setLastRepliedPost] = useState(null);
  const [isSmallWindow, setIsSmallWindow] = useState(window.innerWidth <= 1100);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const postsRef = useRef(posts);
  const apiUrl = process.env.REACT_APP_API_URL;
  const avatarsUrl = process.env.REACT_APP_AVATAR_IMAGES_URL;


  // se obtienen posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${apiUrl}/forum/posts`);
        const data = await response.json();
        setPosts(data);
        setLoading(false);
      } catch (error) {
        console.error('Error obteniendo los posts:', error);
        setError('No hay conexión con el servidor:\nNo se pudieron cargar los datos. Inténtalo de nuevo');
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // se obtiene las categorías disponibles de los posts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${apiUrl}/forum/posts/post-categories`);
        const data = await res.json();

        // orden de las categorías por orden alfabético
        const sorted = data.sort((a, b) => a.name.localeCompare(b.name));

        setAvailableCategories(sorted);
      } catch (err) {
        console.error('Error cargando categorías:', err);
      }
    };

    fetchCategories();
  }, []);

  // actualiza la referencia a posts
  useEffect(() => {
    postsRef.current = posts;
  }, [posts]);

  // autofetch para comprobar si hay nuevos posts disponibles
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // consulta número de posts disponibles
        const response = await fetch(`${apiUrl}/forum/posts/post-count`);
        const data = await response.json();
        
        if (data.count > postsRef.current.length) { setNewPostsAvailable(true); }
      } catch (error) {
        console.error("Error comprobando nuevos posts:", error);
      }
    }, 60000); // cada 60 segundos

    return () => clearInterval(interval);
  }, []);

  // comprueba si había un post abierto al visitar la página
  // (útil si se recarga la página con un post abierto)
  useEffect(() => {
    if (postId) {
      fetchPostById(postId);
    }
  }, [postId]);

  // busca el post por id
  const fetchPostById = async (id) => {
    try {
      const response = await fetch(`${apiUrl}/forum/posts/${id}`);
      const data = await response.json();
      setSelectedPost(data);
    } catch (error) {
      console.error("Error cargando el post:", error);
    }
  };

  // controla la apertura del modal del post desde la ruta
  const handleOpenPostModal = (post) => {
    setSelectedPost(post);
    navigate(`/foro/post/${post._id}`); // actualiza la URL
  };

  // controla el cierre del modal del post desde la ruta
  const handleClosePostModal = () => {
    if (selectedPost) {
      // borra la sesión guardada del post abierto
      sessionStorage.removeItem(`forum_post_${selectedPost._id}_state`);
      // borra la posición de scroll de visualización del modal del post
      sessionStorage.removeItem(`forum_post_${selectedPost._id}_scrollTop`);
    }

    // si se respondió al post, actualización temporal en local
    // de número de respuestas del post
    if (lastRepliedPost === selectedPost._id) {
      setPosts(prevPosts =>
        prevPosts.map(p =>
          p._id === selectedPost._id
            ? { ...p, replies: [...p.replies, {}] }
            : p
        )
      );
      setLastRepliedPost(null);
    }

    setSelectedPost(null);
    navigate('/foro'); // vuelve a la vista sin modal de post
  };

  // para ordenar y filtrar los posts cuando cambian los filtros o el orden
  useEffect(() => {
    let postsFiltered = [...posts];

    if (selectedCategories.length > 0) {
      postsFiltered = postsFiltered.filter(post =>
        Array.isArray(post.categories) &&
        post.categories.some(cat => selectedCategories.includes(cat.name))
      );

    }

    if (orderBy === 'latest') {
      postsFiltered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (orderBy === 'oldest') {
      postsFiltered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (orderBy === 'lastReply') {
      postsFiltered.sort((a, b) => new Date(b.lastReplyAt) - new Date(a.lastReplyAt));
    } else if (orderBy === 'replies') {
      postsFiltered.sort((a, b) => b.replies.length - a.replies.length);
    }

    setFilteredPosts(postsFiltered);
  }, [selectedCategories, orderBy, posts]);

  // tamaño de pantalla
  useEffect(() => {
    const handleResize = () => setIsSmallWindow(window.innerWidth <= 1100);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // actualización de las categorías seleccionadas para filtro
  const handleCategorySelect = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // mostrar filtros aplicados en el desplegable
  const getFiltersAppliedText = () => {
    const count = selectedCategories.length;
    return count === 0 ? 'Sin filtros aplicados' : `${count} filtro${count == 1 ? '' : 's'} aplicado${count == 1 ? '' : 's'}`;
  };

  // escucha los clicks fuera del desplegable de filtros
  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // cierra el desplegable de filtros si se pulsa fuera de él
  const handleClickOutside = (e) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target) &&
      !buttonRef.current.contains(e.target)
    ) {
      setDropdownOpen(false);
    }
  };

  // se muestran sólo los primeros posts
  const displayedPosts = filteredPosts.slice(0, visibleCount);
  // determina si hay más posts disponibles para mostrar
  const hasMore = visibleCount < filteredPosts.length;

  // refresca la lista de posts para mostrar el nuevo
  function handleCreateNewPost(newPost) {
    setPosts(prev => [newPost, ...prev]);

    // si el nuevo post tiene nuevas categorías, se añaden a las dispinibles para filtrar
    const newCategories = newPost.categories || [];
    setAvailableCategories(prevCategories => {
      const existingCatNames = prevCategories.map(cat => cat.name);
      const categoriesToAdd = newCategories.filter(cat => !existingCatNames.includes(cat.name));

      // evita duplicados
      if (categoriesToAdd.length === 0) return prevCategories;

      return [...prevCategories, ...categoriesToAdd];
    });

    // se añade actividad de reciclaje
    handleRecyclingActivity();
  }

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

  if (loading) return <div className="forum loading">Recuperando datos...</div>;
  if (error) return <div className="forum">
      {<NotificationMessage
          textMessage={error}
          notificationType={"error"} />
      }
  </div>;

  return (
    <div className="forum">
      <div className="header-container">
        {user && (<div className="new-post-button-wrapper">
          <button
            className={`new-post-button ${isSmallWindow ? 'floating' : ''}`}
            onClick={() => setShowNewPostModal(true)}
          >
            {isSmallWindow ? '+' : '+ Nuevo post'}
          </button>
        </div>)}
        <div className="category-select">
          <label>Categorías:</label>
          <div className="custom-select">
            <div className="dropdown" ref={dropdownRef}>
              <button
                className="dropdown-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                ref={buttonRef}
              >
                {getFiltersAppliedText()}
              </button>
              {dropdownOpen && (
                <div className="dropdown-content">
                  <div className="checkbox-options">
                    {availableCategories.map((cat) => (
                      <label key={cat._id || cat.name} className="checkbox-label">
                        <input
                          type="checkbox"
                          value={cat.name}
                          checked={selectedCategories.includes(cat.name)}
                          onChange={() => handleCategorySelect(cat.name)}
                        />
                        {cat.name}
                      </label>
                    ))}
                  </div>
                  <button className="ok-btn" onClick={() => setDropdownOpen(false)}>OK</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="order-select">
          <label>Ordenar:</label>
          <select onChange={(e) => setOrderBy(e.target.value)} value={orderBy}>
            <option value="latest">Últimas creadas</option>
            <option value="oldest">Más antiguas</option>
            <option value="lastReply">Últimas actualizadas</option>
            <option value="replies">Más respuestas</option>
          </select>
        </div>
      </div>

      <div className="posts">
        {posts.length === 0 && (
          <div className="no-posts-message">
            <p>Aún no hay publicaciones. ¡Sé el primero en crear una!</p>
          </div>
        )}

        {newPostsAvailable && (
          <div
            className="forum-update-banner"
            onClick={() => {
              // recarga los posts
              fetch(`${apiUrl}/forum/posts`)
                .then(res => res.json())
                .then(data => {
                  setPosts(data);
                  setNewPostsAvailable(false);
                });
            }}
          >
            - Nuevos mensajes disponibles. Haz clic para actualizar -
          </div>
        )}

        {filteredPosts.length > 0 && (
          <>
            {displayedPosts.map((post) => (
              <div key={post._id} className="post" onClick={() => handleOpenPostModal(post)}>
                <div className="post-header">
                  <p className="dates">
                    <span className="created-container">
                      <span className="date-label">Creado:</span>
                      <span className="date">{convertUTCDateTime(post.createdAt)}</span>
                    </span>
                    <span className="separator">|</span>
                    <span className="last-updated-container">
                      <span className="date-label">Última respuesta:</span>
                      <span className="date">{convertUTCDateTime(post.lastReplyAt)}</span>
                    </span>
                  </p>
                  <div className="post-title">
                    {post.type === 'event' ? <FaCalendar color="#FF6F00" /> : <FaCommentDots color="#89c26e" />}
                    <span className="text-container">
                      <h3>{post.title}</h3>
                      <span className="category">Categorías: {
                        Array.isArray(post.categories)
                          ? post.categories.map(c => c.name).join(', ')
                          : post.categories?.name || 'Sin categoría'
                      }</span>
                    </span>
                  </div>
                </div>
                <div className="post-footer">
                  <div className="created-info">
                    <span className="created-by-label">Creado por:</span>
                    {user && post.createdBy ? (
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
                          {post.createdBy?.fullname}
                        </Link>
                    </UserCardTooltip>
                    ) : (
                      <span className="created-by">usuario eliminado</span>
                    )}                    
                  </div>
                  <div className="spacer"></div>
                  <div className="replies">
                    <span className="icon"><FaComment /></span>
                    <span>{post.replies?.length || 0}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* para mostrar si hay más posts y cargarlos si los hay */}
            {hasMore ? (
              <div className="load-more">
                <button className="load-more-btn" onClick={() => setVisibleCount(visibleCount + numberPostLoad)}>
                  Cargar más
                </button>
              </div>
            ) : (
              <p className="no-more-posts">Ya no hay más publicaciones.</p>
            )}
          </>
        )}
      </div>

      {/* modal para crear nuevo post */}
      {showNewPostModal && (
          <ForumNewPostModal
              onClose={() => setShowNewPostModal(false)}
              onPostCreated={handleCreateNewPost}
          />
      )}

      {/* modal para el post abierto */}
      {selectedPost && (
        <ForumPostModal 
          post={selectedPost} 
          onClose={handleClosePostModal}
          setlastRepliedPost={setLastRepliedPost}
        />
      )}

    </div>
  );
};

export default ForumPage;
