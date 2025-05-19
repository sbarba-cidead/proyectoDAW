import '../../styles/ForumPage.css';

import { useState, useEffect, useRef } from 'react';
import { FaCalendar, FaComment, FaSquareFull } from 'react-icons/fa';

const ForumPage = () => {
  const initialPosts = [
    { id: 1, title: '¿Cómo reciclar correctamente?', content: '¿Cuáles son los mejores métodos para reciclar residuos domésticos?', createdAt: '2023-04-01', lastReplyAt: '2023-04-02', replies: 5, createdBy: 'user12', type: 'post', categories: 'Reciclaje' },
    { id: 2, title: 'Energía renovable en el hogar', content: '¿Qué opciones de energía renovable podemos instalar en casa?', createdAt: '2023-04-03', lastReplyAt: '2023-04-04', replies: 2, createdBy: 'admin1', type: 'event', categories: 'Energía' },
    { id: 3, title: 'Reducir el uso de plásticos', content: '¿Qué alternativas existen para reducir el consumo de plásticos en nuestra vida diaria?', createdAt: '2023-04-05', lastReplyAt: '2023-04-06', replies: 0, createdBy: 'user32', type: 'post', categories: 'Reciclaje' },
    { id: 4, title: 'Reciclaje de electrónicos', content: '¿Cómo podemos reciclar nuestros dispositivos electrónicos de manera responsable?', createdAt: '2023-04-07', lastReplyAt: '2023-04-07', replies: 3, createdBy: 'admin1', type: 'event', categories: 'Electrónica' },
    { id: 5, title: '¿Qué es la huella de carbono?', content: '¿Cómo podemos medir y reducir nuestra huella de carbono?', createdAt: '2023-04-08', lastReplyAt: '2023-04-09', replies: 1, createdBy: 'user11', type: 'post', categories: 'Sostenibilidad' },
    { id: 6, title: 'Estrategias para un consumo responsable', content: '¿Qué acciones podemos tomar para consumir de forma más responsable?', createdAt: '2023-04-09', lastReplyAt: '2023-04-10', replies: 4, createdBy: 'user11', type: 'post', categories: 'Consumo responsable' },
    { id: 7, title: 'Compostaje en casa', content: '¿Cómo podemos hacer compostaje en casa para reducir residuos orgánicos?', createdAt: '2023-04-11', lastReplyAt: '2023-04-12', replies: 0, createdBy: 'admin2', type: 'event', categories: 'Reciclaje' },
    { id: 8, title: 'El futuro del reciclaje plástico', content: '¿Cómo va a evolucionar el reciclaje del plástico en el futuro cercano?', createdAt: '2023-04-13', lastReplyAt: '2023-04-14', replies: 7, createdBy: 'admin2', type: 'event', categories: 'Plásticos' },
    { id: 9, title: 'Estrategias para el reciclaje urbano', content: '¿Qué podemos hacer para mejorar el reciclaje en nuestras ciudades?', createdAt: '2023-04-15', lastReplyAt: '2023-04-16', replies: 2, createdBy: 'user22', type: 'post', categories: 'Reciclaje' },
    { id: 10, title: 'La sostenibilidad en la moda', content: '¿Cómo puede la industria textil ser más sostenible y reducir el impacto ambiental?', createdAt: '2023-04-17', lastReplyAt: '2023-04-18', replies: 1, createdBy: 'admin1', type: 'event', categories: 'Moda' },
    { id: 11, title: 'Plantas purificadoras de aire', content: '¿Cuáles son las mejores plantas para purificar el aire en casa?', createdAt: '2023-04-18', lastReplyAt: '2023-04-19', replies: 0, createdBy: 'user12', type: 'post', categories: 'Sostenibilidad' },
    { id: 12, title: 'Movimientos a favor del reciclaje global', content: '¿Cuáles son los movimientos internacionales que están promoviendo el reciclaje?', createdAt: '2023-04-19', lastReplyAt: '2023-04-20', replies: 6, createdBy: 'user22', type: 'event', categories: 'Reciclaje' },
  ];

  const numberPostShown = 5
  const numberPostLoad = 3

  const [visibleCount, setVisibleCount] = useState(numberPostShown);
  const [orderBy, setOrderBy] = useState('latest');
  const [categories, setCategories] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Ordenar y filtrar los posts cuando cambian los filtros aplicados o el orden
  useEffect(() => {
    let posts = [...initialPosts];

    if (categories.length > 0) {
      posts = posts.filter(post => categories.includes(post.categories));
    }

    if (orderBy === 'latest') {
      posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (orderBy === 'oldest') {
      posts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (orderBy === 'lastReply') {
      posts.sort((a, b) => new Date(b.lastReplyAt) - new Date(a.lastReplyAt));
    } else if (orderBy === 'replies') {
      posts.sort((a, b) => b.replies - a.replies);
    }

    setFilteredPosts(posts);
  }, [categories, orderBy]);

  // Actualización de las categorías seleccionadas para filtro
  const handleCategorySelect = (category) => {
    setCategories((prev) =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Mostrar filtros aplicados en el desplegable
  const getFiltersAppliedText = () => {
    const count = categories.length;
    return count === 0 ? 'Sin filtros aplicados' : `${count} filtro${count == 1 ? '' : 's'} aplicado${count == 1 ? '' : 's'}`;
  };

  // escucha los clicks fuera del desplegable de filtros
  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Cerrar desplegable de filtros si se pulsa fuera de él
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
                    {['Reciclaje', 'Energía', 'Sostenibilidad', 'Consumo responsable', 'Moda', 'Electrónica', 'Plásticos'].map((cat) => (
                      <label key={cat} className="checkbox-label">
                        <input
                          type="checkbox"
                          value={cat}
                          checked={categories.includes(cat)}
                          onChange={() => handleCategorySelect(cat)}
                        />
                        {cat}
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
          <div key={post.id} className="post">
            <div className="post-header">
              <p>
                <span className="created-container">
                  <span className="date-label">Creado:</span>
                  <span className="date">{post.createdAt}</span>
                </span>
                <span className="separator">|</span>
                <span className="last-updated-container">
                  <span className="date-label">Última respuesta:</span>
                  <span className="date">{post.lastReplyAt}</span>
                </span>
              </p>
              <div className="post-title">
                {post.type === 'event' ? <FaCalendar color="#FF6F00" /> : <FaSquareFull color="#FFFFFF" />}
                <span className="text-container">
                  <h3>{post.title}</h3>
                  <span className="category">Categorías: {post.categories}</span>
                </span>
              </div>
            </div>
            <div className="post-footer">
              <p>
                <span className="created-by-label">Creado por:</span>
                <span className="created-by">{post.createdBy}</span>
              </p>
              <div className="spacer"></div>
              <div className="replies">
                <span className="icon"><FaComment /></span>
                <span>{post.replies}</span>
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
    </div>
  );
};

export default ForumPage;
