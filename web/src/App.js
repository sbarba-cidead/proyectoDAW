import './App.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useState } from 'react';

import Navbar from './components/Navbar';
import Home from './components/Home';
import ProfilePage from './components/ProfilePage';
import Tools from './components/Tools';

function App() {
  const [showLogin, setShowLogin] = useState(false);

  // comprueba si la ruta actual es '/' (home)
  const isHome = window.location.pathname === '/';

  return (
    <Router>
      <div className="App">
        {/* Condicional para mostrar la Navbar solo si no es la ruta de Home */}
        {!isHome && <Navbar />}

        <Routes>
          <Route path="/" element={
            <div className={"content home"}>
              <Home />
            </div>
          } />
          <Route path="/perfil-usuario" element={
            <div className={"content other"}>
              <ProfilePage />
            </div>
          } />
          <Route path="/herramientas" element={
            <div className={"content other"}>
              <Tools />
            </div>
          } />
        </Routes>

        {/* Condicional para mostrar el pie de página solo si no es la ruta de Home */}
        {!isHome && (
          <div className="footer">
            <p>© 2025 Sandra Barba García</p>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
