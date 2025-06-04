import './App.css';

import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import { UserProvider } from './context/UserContext';
import { WEBSITE_NAME } from './config/constants';

import NotFoundPage from './components/error-pages/NotFoundPage';
import ProtectedRoute from './components/error-pages/ProtectedRoute';

import Header from './components/page-elements/Header';
import HomePage from './components/pages/HomePage';
import ProfilePage from './components/pages/ProfilePage';
import ToolsPage from './components/pages/ToolsPage';
import EcoCalcPage from './components/pages/EcoCalcPage';
import MapPage from './components/pages/MapPage';
import RecycleContainers from './components/pages/RecycleGuidePage';
import ForumPage from './components/pages/ForumPage';
import EcoInfoPage from './components/pages/EcoInfoPage';
import ResetPasswordPage from './components/pages/ResetPasswordPage';

import recyclingMapImg from 'assets/recycling-map.webp';
import ecoCalcImg from 'assets/ecocalc.webp';
import recyclingGuideImg from 'assets/recycling-guide.webp';


const pageTitles = {
  "/perfil-usuario": "Datos de usuario",
  "/herramientas": "Herramientas de Sostenibilidad",
  "/calculadora-huella-ecologica": "Calculadora de Huella Ecológica",
  "/mapa-reciclaje": "Mapa de Reciclaje",
  "/contenedores-reciclaje": "Contenedores de Reciclaje",
  "/foro": "Comunidad de Sostenibilidad",
  "/informacion-sostenibilidad": "Información sobre Sostenibilidad",
  "/reset-password": "Recuperación de contraseña"
};

const presentImages = [recyclingMapImg, ecoCalcImg, recyclingGuideImg];


function AppContent() {
  const [isHome, setIsHome] = useState(false);
  const [headerTitle, setHeaderTitle] = useState(WEBSITE_NAME);
  const location = useLocation(); // localización de ruta url en la web


  // precarga de imágenes estáticas
  useEffect(() => {
    presentImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);
  
  // actualiza el título para la cabecera y la pestaña del navegador
  useEffect(() => {
    // comprueba si la ruta actual es '/' (home)
    const isHomeRoute = location.pathname === '/';
    setIsHome(isHomeRoute);

    // calcula el título basado en la ruta que se está visitando
    const currentPageName = Object.entries(pageTitles).find(([path]) =>
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    )?.[1] || "";

    let tabTitle = WEBSITE_NAME;

    if (isHomeRoute) { // home
      tabTitle = WEBSITE_NAME;
    } else if (currentPageName) { // rutas definidas
      tabTitle = `${currentPageName} - ${WEBSITE_NAME}`;
      setHeaderTitle(currentPageName); // nombre para pasar al header
    } else { // otras rutas
      tabTitle = `Página no encontrada - ${WEBSITE_NAME}`;
      setHeaderTitle(""); // nombre para pasar al header
    }

    document.title = tabTitle; // actualiza el nombre para la pestaña del navegador

  }, [location.pathname]);


  return (
    <div className="App">
      {/* Condicional para mostrar la Navbar solo si no es la ruta de Home */}
      {!isHome && <Header currentTitle={headerTitle} />}

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
        <Route path="/perfil-usuario/:username" element={
          <div className={"content other"}>
            <ProtectedRoute>
              <ProfilePage setHeaderTitle={setHeaderTitle} />
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
            <RecycleContainers />
          </div>
        } />
        <Route path="/foro" element={
          <div className={"content other"}>
            <ForumPage />
          </div>
        } />
        <Route path="/foro/post/:postId" element={
          <div className={"content other"}>
            <ForumPage />
          </div>
        } />
        <Route path="/informacion-sostenibilidad" element={
          <div className={"content other"}>
            <EcoInfoPage />
          </div>
        } />
        <Route path="/reset-password" element={
          <div className={"content other"}>
            <ResetPasswordPage />
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
