import React, { useState, useEffect, useRef } from 'react';
import '../styles/Forum.css';
import { FaComment, FaUser, FaUserShield } from 'react-icons/fa';

const Forum = () => {
  const initialPosts = [
    { id: 1, title: '¿Cómo reciclar correctamente?', content: '¿Cuáles son los mejores métodos para reciclar residuos domésticos?', createdAt: '2023-04-01', lastReplyAt: '2023-04-02', replies: 5, createdBy: 'user', category: 'Reciclaje' },
    { id: 2, title: 'Energía renovable en el hogar', content: '¿Qué opciones de energía renovable podemos instalar en casa?', createdAt: '2023-04-03', lastReplyAt: '2023-04-04', replies: 2, createdBy: 'admin', category: 'Energía' },
    { id: 3, title: 'Reducir el uso de plásticos', content: '¿Qué alternativas existen para reducir el consumo de plásticos en nuestra vida diaria?', createdAt: '2023-04-05', lastReplyAt: '2023-04-06', replies: 0, createdBy: 'user', category: 'Reciclaje' },
    { id: 4, title: 'Reciclaje de electrónicos', content: '¿Cómo podemos reciclar nuestros dispositivos electrónicos de manera responsable?', createdAt: '2023-04-07', lastReplyAt: '2023-04-07', replies: 3, createdBy: 'admin', category: 'Electrónica' },
    { id: 5, title: '¿Qué es la huella de carbono?', content: '¿Cómo podemos medir y reducir nuestra huella de carbono?', createdAt: '2023-04-08', lastReplyAt: '2023-04-09', replies: 1, createdBy: 'user', category: 'Sostenibilidad' },
    { id: 6, title: 'Estrategias para un consumo responsable', content: '¿Qué acciones podemos tomar para consumir de forma más responsable?', createdAt: '2023-04-09', lastReplyAt: '2023-04-10', replies: 4, createdBy: 'user', category: 'Consumo responsable' },
    { id: 7, title: 'Compostaje en casa', content: '¿Cómo podemos hacer compostaje en casa para reducir residuos orgánicos?', createdAt: '2023-04-11', lastReplyAt: '2023-04-12', replies: 0, createdBy: 'admin', category: 'Reciclaje' },
    { id: 8, title: 'El futuro del reciclaje plástico', content: '¿Cómo va a evolucionar el reciclaje del plástico en el futuro cercano?', createdAt: '2023-04-13', lastReplyAt: '2023-04-14', replies: 7, createdBy: 'admin', category: 'Plásticos' },
    { id: 9, title: 'Estrategias para el reciclaje urbano', content: '¿Qué podemos hacer para mejorar el reciclaje en nuestras ciudades?', createdAt: '2023-04-15', lastReplyAt: '2023-04-16', replies: 2, createdBy: 'user', category: 'Reciclaje' },
    { id: 10, title: 'La sostenibilidad en la moda', content: '¿Cómo puede la industria textil ser más sostenible y reducir el impacto ambiental?', createdAt: '2023-04-17', lastReplyAt: '2023-04-18', replies: 1, createdBy: 'admin', category: 'Moda' },
    { id: 11, title: 'Plantas purificadoras de aire', content: '¿Cuáles son las mejores plantas para purificar el aire en casa?', createdAt: '2023-04-18', lastReplyAt: '2023-04-19', replies: 0, createdBy: 'user', category: 'Sostenibilidad' },
    { id: 12, title: 'Movimientos a favor del reciclaje global', content: '¿Cuáles son los movimientos internacionales que están promoviendo el reciclaje?', createdAt: '2023-04-19', lastReplyAt: '2023-04-20', replies: 6, createdBy: 'user', category: 'Reciclaje' },
  ];

  const [posts, setPosts] = useState(initialPosts);
  const [loadMore, setLoadMore] = useState(10);
  const [orderBy, setOrderBy] = useState('latest');
  const [categories, setCategories] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false); // Estado para controlar el desplegable
  const dropdownRef = useRef(null); // Referencia para el dropdown
  const buttonRef = useRef(null); // Referencia para el botón de 'OK'

  // Función para ordenar las publicaciones según el criterio seleccionado
  const sortPosts = (criteria) => {
    let sortedPosts;
    if (criteria === 'latest') {
      sortedPosts = [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (criteria === 'oldest') {
      sortedPosts = [...posts].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (criteria === 'lastReply') {
      sortedPosts = [...posts].sort((a, b) => new Date(b.lastReplyAt) - new Date(a.lastReplyAt));
    } else if (criteria === 'replies') {
      sortedPosts = [...posts].sort((a, b) => b.replies - a.replies);
    }
    setPosts(sortedPosts);
  };

  // Función para cargar más publicaciones
  const handleLoadMore = () => {
    const newPosts = initialPosts.slice(loadMore, loadMore + 10);
    setPosts([...posts, ...newPosts]);
    setLoadMore(loadMore + 10);
  };

  // Función para filtrar por categorías seleccionadas
  const handleCategorySelect = (category) => {
    setCategories((prevCategories) => {
      const updatedCategories = prevCategories.includes(category)
      ? prevCategories.filter(item => item !== category)
      : [...prevCategories, category];

      // Filtra las publicaciones según las categorías seleccionadas
      const filteredPosts = initialPosts.filter((post) =>
        updatedCategories.length === 0 || updatedCategories.includes(post.category)
      );
      setPosts(filteredPosts);

      return updatedCategories;
    });
  };

  // Función para contar los filtros aplicados
  const getFiltersAppliedText = () => {
    const filtersCount = categories.length;
    
    if (filtersCount === 0) {
      return 'Sin filtros aplicados';
    } else if (filtersCount === 1) {
      return '1 filtro aplicado';
    } else {
      return `${filtersCount} filtros aplicados`;
    }
  };

  // Función para cerrar el dropdown si se hace clic fuera
  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target) && !buttonRef.current.contains(e.target)) {
      setDropdownOpen(false);
    }
  };

  // Usamos useEffect para escuchar los clics fuera del dropdown
  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="forum">
      <div className="filters-container">
        {/* Desplegable para seleccionar categorías con checkboxes */}
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
                    {['Reciclaje', 'Energía', 'Sostenibilidad', 'Consumo responsable', 'Moda', 'Electrónica', 'Plásticos'].map((category) => (
                      <label key={category} className="checkbox-label">
                        <input
                          type="checkbox"
                          value={category}
                          checked={categories.includes(category)}
                          onChange={() => handleCategorySelect(category)}
                        />
                        {category}
                      </label>
                    ))}
                  </div>
                  <button className="ok-btn" onClick={() => setDropdownOpen(false)}>OK</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desplegable para ordenar las publicaciones */}
        <div className="order-select">
          <label>Ordenar por:</label>
          <select onChange={(e) => { setOrderBy(e.target.value); sortPosts(e.target.value); }}>
            <option value="latest">Últimas creadas</option>
            <option value="oldest">Más antiguas</option>
            <option value="lastReply">Últimas actualizadas</option>
            <option value="replies">Más respuestas</option>
          </select>
        </div>
      </div>

      {/* Muestra las publicaciones */}
      <div className="posts">
        {posts.map((post) => (
          <div key={post.id} className="post">
            <div className="post-header">
              <p>
                <span className="date-label">Creado:</span>
                <span className="date">{post.createdAt}</span>
                <span className="separator">|</span>
                <span className="date-label">Última respuesta:</span>
                <span className="date">{post.lastReplyAt}</span>
              </p>
              <div className="post-title">
                {post.createdBy === 'admin' ? <FaUserShield color="red" /> : <FaUser color="blue" />}
                <h3>{post.title}</h3>
                <span className="category">({post.category})</span>
              </div>
            </div>
            <div className="post-footer">
              <div className="spacer"></div>
              <div className="replies">
                <span className="icon"><FaComment /></span>
                <span>{post.replies}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cargar más publicaciones */}
      {loadMore >= initialPosts.length ? (
        <p className="no-more-posts">Ya no hay más publicaciones.</p>
      ) : (
        <div className="load-more">
          <button className="load-more-btn" onClick={() => setLoadMore(loadMore + 10)}>Cargar más</button>
        </div>
      )}
    </div>
  );
};

export default Forum;
