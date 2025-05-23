import '../../styles/ForumPage.css';

import { useState, useEffect, useRef } from 'react';
import { format, toZonedTime } from 'date-fns-tz';
import { FaCalendar, FaComment, FaSquareFull } from 'react-icons/fa';
import ForumPostModal from '../ForumPostModal';

const ForumPage = () => {
  const numberPostShown = 5
  const numberPostLoad = 3

  const [posts, setPosts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(numberPostShown);
  const [orderBy, setOrderBy] = useState('latest');
  const [availableCategories, setAvailableCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const apiUrl = process.env.REACT_APP_API_URL;


  // se obtienen posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${apiUrl}/forum/forum-posts`);
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('Error obteniendo los posts:', error);
      }
    };

    fetchPosts();
  }, []);

  // se obtiene las categorías disponibles de los posts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${apiUrl}/forum/post-categories`);
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
      postsFiltered.sort((a, b) => b.replies - a.replies);
    }

    setFilteredPosts(postsFiltered);
  }, [selectedCategories, orderBy, posts]);

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

  // convertir fecha/hora de UTC a hora España península
  // y darle formato adecuado de salida
  const convertUTCDateTime = (datetimeUTC) => {
    const spanishZone = 'Europe/Madrid';

    const datetimeLocal = toZonedTime(datetimeUTC, spanishZone);
    return format(datetimeLocal, 'dd/MM/yyyy HH:mm', { timeZone: spanishZone });
  }


  return (
    <div className="forum">
      <div className="filters-container">
        <div className="category-select">
          <label>Filtrar por categorías:</label>
          <div className="custom-select">
            <div className={`dropdown ${dropdownOpen ? 'open' : ''}`} ref={dropdownRef}>
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
          <label>Ordenar por:</label>
          <select onChange={(e) => setOrderBy(e.target.value)} value={orderBy}>
            <option value="latest">Últimas creadas</option>
            <option value="oldest">Más antiguas</option>
            <option value="lastReply">Últimas actualizadas</option>
            <option value="replies">Más respuestas</option>
          </select>
        </div>
      </div>

      <div className="posts">
        {displayedPosts.map((post) => (
          <div key={post.id} className="post" onClick={() => setSelectedPost(post)}>
            <div className="post-header">
              <p>
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
                {post.type === 'event' ? <FaCalendar color="#FF6F00" /> : <FaSquareFull color="#FFFFFF" />}
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
              <p>
                <span className="created-by-label">Creado por:</span>
                <span className="created-by">{post.createdBy?.username || 'Anónimo'}</span>
              </p>
              <div className="spacer"></div>
              <div className="replies">
                <span className="icon"><FaComment /></span>
                <span>{post.replies?.length || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMore ? (
        <div className="load-more">
          <button className="load-more-btn" onClick={() => setVisibleCount(visibleCount + numberPostLoad)}>
            Cargar más
          </button>
        </div>
      ) : (
        <p className="no-more-posts">Ya no hay más publicaciones.</p>
      )}

      {/* modal para el post abierto */}
      {selectedPost && (
        <ForumPostModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}

    </div>
  );
};

export default ForumPage;
