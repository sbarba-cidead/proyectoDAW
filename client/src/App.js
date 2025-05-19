import './App.css';

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import { UserProvider } from './context/UserContext';

import NotFoundPage from './components/error-pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';

import Navbar from './components/Header';
import HomePage from './components/pages/HomePage';
import ProfilePage from './components/pages/ProfilePage';
import ToolsPage from './components/pages/ToolsPage';
import EcoCalcPage from './components/pages/EcoCalcPage';
import MapPage from './components/pages/MapPage';
import RecycleBins from './components/pages/RecycleGuidePage';
import ForumPage from './components/pages/ForumPage';
import EcoInfoPage from './components/pages/EcoInfoPage';

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
            <HomePage />
          </div>
        } />
        <Route path="/perfil-usuario" element={
          <div className={"content other"}>
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          </div>
        } />
        <Route path="/herramientas" element={
          <div className={"content other"}>
            <ToolsPage />
          </div>
        } />
        <Route path="/calculadora-huella-ecologica" element={
          <div className={"content other"}>
            <EcoCalcPage />
          </div>
        } />
        <Route path="/mapa-reciclaje" element={
          <div className={"content other"}>
            <MapPage />
          </div>
        } />
        <Route path="/contenedores-reciclaje" element={
          <div className={"content other"}>
            <RecycleBins />
          </div>
        } />
        <Route path="/foro" element={
          <div className={"content other"}>
            <ForumPage />
          </div>
        } />
        <Route path="/informacion-sostenibilidad" element={
          <div className={"content other"}>
            <EcoInfoPage />
          </div>
        } />

        {/* Ruta para páginas no encontradas */}
        <Route path="*" element={
          <div className={"content other"}>
            <NotFoundPage />
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
      <UserProvider>
        <AppContent />
      </UserProvider>
    </Router>
  )
}

export default App;
