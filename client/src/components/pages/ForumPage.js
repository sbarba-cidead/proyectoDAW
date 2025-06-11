import 'styles/pages/ForumPage.css';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaBan, FaCalendar, FaComment, FaCommentDots, FaSearch, FaTrashAlt } from 'react-icons/fa';
import { useUserContext } from 'context/UserContext';
import ForumPostModal from 'components/modals/ForumPostModal';
import ForumNewPostModal from 'components/modals/ForumNewPostModal';
import ForumSearchModal from 'components/modals/ForumSearchModal';
import UserCardTooltip from 'components/page-elements/UserCardTooltip';
import { convertUTCDateTime, sendRecyclingActivity } from 'utils/functions';
import NotificationMessage from 'components/page-elements/NotificationMessage';
import ConfirmDialog, { confirm } from 'components/page-elements/ConfirmDialog';

const ForumPage = () => {
  const numberPostShown = 5; // número de posts que se muestran por paginación
  const numberPostLoad = 10; // número de posts que se cargan por paginación

  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useUserContext();
  const initialTotalPostCountRef = useRef(null); // número total de posts disponibles en BD
  const [posts, setPosts] = useState([]); // posts cargados, se actualiza con paginación
  const [displayedPosts, setDisplayedPosts] = useState([]); // post mostrados en UI 
  const [nextPageToLoad, setNextPageToLoad] = useState(1); // paginación de posts (número de página)
  const [canLoadMorePosts, setCanLoadMorePosts] = useState(true);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationMessageType, setNotificationMessageType] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [orderBy, setOrderBy] = useState('latest');
  const [availableCategories, setAvailableCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
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


  // función para obtener las categorías disponibles de los posts
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/forum/posts/post-categories`);
      const data = await res.json();

      // orden de las categorías por orden alfabético
      const sorted = data.sort((a, b) => a.name.localeCompare(b.name));

      setAvailableCategories(sorted);
    } catch (error) {
      console.error('Error cargando categorías:', error);
      throw error;
    }
  }, [apiUrl]);

  // función para carga paginada de posts
  const fetchPosts = useCallback(async (pageToLoad) => {
    const queryParams = new URLSearchParams({
      page: pageToLoad,
      limit: numberPostLoad, // número de posts que se cargarán
      orderBy,
    });

    // si se han seleccionado categorías para filtrar
    if (selectedCategories.length > 0) {
      // los añade a la query
      queryParams.append('categories', selectedCategories.join(','));
    }

    try {
      // hace la consulta de posts con los parámetros definidos
      const postsRes = await fetch(`${apiUrl}/forum/posts/filter?${queryParams}`);
      const postsData = await postsRes.json();
      const newPosts = postsData.posts; 

      // variable para autofetch //
      // si es la primera carga, guarda el total de posts disponibles en BD
      if (pageToLoad === 1 && initialTotalPostCountRef.current === null) {
        initialTotalPostCountRef.current = postsData.total;
      }

      // variable para load more //
      // si hay más posts en BD, se actualiza a true la variable para cargar más
      // si no hay más, se actualiza a false
      setCanLoadMorePosts(postsData.total  > (posts.length + newPosts.length));

      // añade nuevos posts a la lista de posts cargados (sólo si no estaban ya)
      setPosts(prev => {
        const combined = [...prev, ...newPosts];
        return Array.from(new Map(combined.map(p => [p._id, p])).values());
      });

      // devuelve los posts que se han recuperado
      return newPosts;
    } catch (error) {
      console.error('Error al cargar posts:', error);
      throw error;
    }
  }, [apiUrl, orderBy, posts.length, selectedCategories]);

  // función principal que carga todo al inicio y al aplicar cambios
  const loadData = useCallback(async () => {
    setPageError(null);
    setLoading(true);

    let firstPosts;

    try {
      firstPosts = await fetchPosts(1);
      setDisplayedPosts(firstPosts.slice(0, numberPostShown));
      await fetchCategories();
    } catch (error) {
      console.error('Error obteniendo los posts:', error);
      console.log("hola");
      setPageError('No hay conexión con el servidor:\nNo se pudieron cargar los datos. Inténtalo de nuevo');
    } finally {
      setLoading(false);
    }
  }, [fetchPosts, fetchCategories, numberPostShown]);

  // carga inicial y para cambio de filtros y ordenacion
  useEffect(() => {
    loadData();

    if (user && user.banned) {
      showTempNotification("Tu usuario está baneado, no puedes publicar posts o respuestas.", "warning", 5000);
    }
  }, [selectedCategories, orderBy, user, loadData]);

  // para mostrar mensaje de notificicación
  const showTempNotification = (msg, type, duration) => {
      setNotificationMessage(msg);
      setNotificationMessageType(type);
      setTimeout(() => setNotificationMessage(''), duration);
  };

  // reseteo de variables para aplicar order y filtros
  const resetValues = () => {
    setPosts([]);
    setDisplayedPosts([]);
    setNextPageToLoad(1);
  }

  // controla la carga de más posts por paginación
  const handleLoadMore = async () => {
    const currenttlyShownPosts = displayedPosts.length;

    // si hay posts sin mostrar dentro de los ya cargados, muestra más
    if (currenttlyShownPosts < posts.length) {
      const newSlice = posts.slice(0, currenttlyShownPosts + numberPostShown);
      setDisplayedPosts(newSlice);
    }

    // precarga más del backend si hay disponibles
    if (canLoadMorePosts) { // si hay más disponibles
      const nextPage = nextPageToLoad + 1;
      await fetchPosts(nextPage);
      setNextPageToLoad(nextPage);
    }
  };

  // busca el post por id
  const fetchPostById = useCallback(async (id) => {
    try {
      const response = await fetch(`${apiUrl}/forum/posts/${id}`);
      const data = await response.json();
      setSelectedPost(data);
    } catch (error) {
      console.error("Error cargando el post:", error);
    }
  }, [apiUrl]);

  // autofetch para comprobar si hay nuevos posts disponibles
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // consulta número de posts disponibles
        const response = await fetch(`${apiUrl}/forum/posts/post-count`);
        const data = await response.json();
        
        if (data.count > initialTotalPostCountRef.current) { setNewPostsAvailable(true); }
      } catch (error) {
        console.error("Error comprobando nuevos posts:", error);
      }
    }, 60000); // cada 60 segundos

    return () => clearInterval(interval);
  }, [apiUrl]);

  // actualiza la referencia a posts
  useEffect(() => {
    postsRef.current = posts;
  }, [posts]);

  // comprueba si había un post abierto al visitar la página
  // (útil si se recarga la página con un post abierto)
  useEffect(() => {
    if (postId) {
      fetchPostById(postId);
    }
  }, [postId, fetchPostById]);

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

  // detecta tamaño de pantalla
  useEffect(() => {
    const handleResize = () => setIsSmallWindow(window.innerWidth <= 1100);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // mostrar filtros aplicados en el desplegable
  const getFiltersAppliedText = () => {
    const count = selectedCategories.length;
    return count === 0 ? 'Sin filtros aplicados' : `${count} filtro${count === 1 ? '' : 's'} aplicado${count === 1 ? '' : 's'}`;
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

  // actualización de las categorías seleccionadas para filtro
  const handleCategorySelect = (category) => {
    resetValues();

    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // refresca la lista de posts para mostrar el nuevo
  function handleCreateNewPost(newPost) {
    setDisplayedPosts(prev => [newPost, ...prev]);

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
    handleRecyclingActivity(newPost._id);
  }

  // (sólo admin) borra un post
  const handleDeletePost = async (postId) => {
    const confirmAnswer = await confirm("Esta acción borrará por completo el post y no puede deshacerse. ¿Continuar?");
    if (!confirmAnswer) return;

    try {
      const res = await fetch(`${apiUrl}/forum/posts/${postId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Error borrando el post');
      }

      showTempNotification('El post se ha eliminado.', 'success', 2000);

      // actualiza el estado local de posts eliminando el post
      setPosts(prevPosts => prevPosts.filter(p => p._id !== postId));
    } catch (error) {      
      showTempNotification('No se pudo borrar el post.\nInténtalo de nuevo.', 'error', 2000);
      console.error('Error al borrar el post:', error);
    }
  };

  // (sólo admin) banea el post, ocultando su texto
  const handleBanPost = async (postId, currentStatus) => {
    const action = currentStatus ? 'desbanear' : 'banear';
    const confirmAnswer = await confirm(`Se va a ${action} este post. ¿Continuar?`);
    if (!confirmAnswer) return;

    try {
      const res = await fetch(`${apiUrl}/forum/posts/${postId}/visibility`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banned: !currentStatus }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Error actualizando la visibilidad');
      }

      showTempNotification(`Se ha completado el cambio de estado del post.`, 'success', 3000);

      setDisplayedPosts(prevPosts =>
        prevPosts.map(p =>
          p._id === postId ? { ...p, banned: !currentStatus } : p
        )
      );
    } catch (error) {      
      showTempNotification(`No se pudo ${action} el post.\nInténtalo de nuevo.`, 'error', 3000);

      console.error('Error al actualizar visibilidad del post:', error);
    }
  };

  // función para guardar una nueva actividad de reciclaje
  const handleRecyclingActivity = async (postID) =>{
      if (!user || user.banned) { return; } // si no hay usuario iniciado o está baneado no guarda la actividad

      try {
          await sendRecyclingActivity('Participar en la Comunidad de Sostenibilidad', postID);
      } catch (error) {
          console.error('Error registrando actividad de reciclaje:', error.message);
      }
  } 

  if (loading) return <div className="forum loading">Recuperando datos...</div>;
  if (pageError) return <div className="forum">
      {<NotificationMessage
          textMessage={pageError}
          notificationType={"error"} />
      }
  </div>;

  return (
    <div className="forum">
      {notificationMessage && 
          <NotificationMessage
            textMessage={notificationMessage}
            notificationType={notificationMessageType} />
      }
      <ConfirmDialog />
      <div className="header-container">
        <div className="forum-page-action-buttons">
          {/* botón de crear post */}
          {user && (
            <button
              className={`new-post-button ${user.banned ? 'banned' : ''} ${isSmallWindow ? 'floating' : ''}`}
              onClick={() => {
                if (user.banned) {
                  showTempNotification("Tu usuario está baneado, no puedes publicar posts o respuestas.", "warning", 3000);
                  return;
                }
                setShowNewPostModal(true);
              }}
            >
              {isSmallWindow ? '+' : '+ Nuevo post'}
            </button>
          )}
          
          {/* buscador */}
          <button
            className={`search-button ${isSmallWindow ? 'floating' : ''}`}
            onClick={() => setShowSearchModal(true)}
          >
            {isSmallWindow ? (<FaSearch />) : (<span><FaSearch /> Buscar</span>)}
          </button>
        </div>

        {/* selector de categoría */}
        <div className="category-select">
          <label htmlFor="category-custom-select">Categorías:</label>
          <div className="custom-select">
            <div className="dropdown" ref={dropdownRef}>
              <button
                id="category-custom-select"
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

        {/* selector de orden de los posts */}
        <div className="order-select">
          <label htmlFor="orderby-select">Ordenar:</label>
          <select id="orderby-select" onChange={(e) => {setOrderBy(e.target.value); resetValues();}} value={orderBy}>
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
            onClick={loadData}
          >
            - Nuevos mensajes disponibles. Haz clic para actualizar la página -
          </div>
        )}

        {posts.length > 0 && (
          <>            
            {displayedPosts.map((post) => (
              <div 
                key={post._id} 
                className={`post ${post.banned ? 'banned' : ''}`} 
                onClick={() => handleOpenPostModal(post)}
              >
                <div className="post-header">
                  {user && user.role === 'admin' && (
                    <div className="admin-actions-container">
                      <div className="admin-actions-bg">
                        <button 
                          title="Banear post" 
                          className="icon-button ban-btn" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBanPost(post._id, post.banned);
                          }}
                        >
                          <FaBan />
                        </button>
                        <button 
                          title="Eliminar post"
                          className="icon-button delete-btn" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePost(post._id);
                          }}
                        >
                          <FaTrashAlt />
                        </button>
                      </div>
                    </div>
                  )}

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
                    {post.type === 'event' ? <FaCalendar color="#FF6F00" /> : <FaCommentDots color="#89c26e" />}
                    <span className="text-container">
                      <h3>{post.banned ? 'Publicación baneada por un administrador' : post.title}</h3>
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
                    {post.createdBy ? (
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
            {displayedPosts.length < posts.length ? (
              <div className="load-more">
                <button className="load-more-btn" onClick={handleLoadMore}>
                  Cargar más
                </button>
              </div>
            ) : (
              <p className="no-more-posts">Ya no hay más publicaciones.</p>
            )}
          </>
        )}
      </div>

      {/* modal para el buscador */}
      {showSearchModal && (
        <ForumSearchModal
          onClose={() => setShowSearchModal(false)}
          onSelectPost={(post) => {
            handleOpenPostModal(post);
            setShowSearchModal(false);
          }}
        />
      )}

      {/* modal para crear nuevo post */}
      {showNewPostModal && (
          <ForumNewPostModal
              user={user}
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
