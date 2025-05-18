import './App.css';

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import Navbar from './components/Header';
import Home from './components/pages/HomePage';
import ProfilePage from './components/pages/ProfilePage';
import Tools from './components/pages/ToolsPage';
import EcoCalc from './components/pages/CalcPage';
import RecycleMap from './components/pages/MapPage';
import RecycleBins from './components/pages/GuidePage';
import Forum from './components/pages/ForumPage';
import EcoInfo from './components/pages/InfoPage';

function AppContent() {
  const location = useLocation(); // página que se está visitando

  // comprueba si la ruta actual es '/' (home)
  const isHome = location.pathname === '/';

  return (
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
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App;
