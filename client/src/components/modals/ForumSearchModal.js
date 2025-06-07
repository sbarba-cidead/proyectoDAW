import 'styles/modals/ForumSearchModal.css';

import { useState } from 'react';


const ForumSearchModal = ({ onClose, apiUrl }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/forum/posts/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.posts || []);
    } catch (error) {
      console.error('Error en la búsqueda:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="forum-search-modal-overlay" onClick={onClose}>
      <div className="forum-search-modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>
        <div className="search-input-wrapper">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar posts por título o contenido..."
          />
          <button onClick={handleSearch}>Buscar</button>
        </div>
        {loading && <p className="search-loading">Buscando...</p>}
        {results.length > 0 && (
          <ul className="search-results">
            {results.map(post => (
              <li key={post._id}>
                <strong>{post.title}</strong><br />
                <span>{post.createdBy?.username || 'usuario eliminado'}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ForumSearchModal;
