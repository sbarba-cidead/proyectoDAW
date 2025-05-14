import './App.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useState } from 'react';

import Navbar from './components/Navbar';
import Home from './components/Home';
import ProfilePage from './components/ProfilePage';
import Tools from './components/Tools';
import EcoCalc from './components/EcoCalc';
import RecycleMap from './components/RecycleMap';
import RecycleBins from './components/RecycleBins';
import Forum from './components/Forum';
import EcoInfo from './components/EcoInfo';

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
          <Route path="/calculadora-huella-ecologica" element={
            <div className={"content other"}>
              <EcoCalc />
            </div>
          } />
          <Route path="/mapa-reciclaje" element={
            <div className={"content other"}>
              <RecycleMap />
            </div>
          } />
          <Route path="/contenedores-reciclaje" element={
            <div className={"content other"}>
              <RecycleBins />
            </div>
          } />
          <Route path="/foro" element={
            <div className={"content other"}>
              <Forum />
            </div>
          } />
          <Route path="/informacion-sostenibilidad" element={
            <div className={"content other"}>
              <EcoInfo />
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
