import '../styles/Tools.css';

function Tools() {
    return (
        <div className="tools">
            <div class="hero-section">
                <h1>Herramientas de Sostenibilidad</h1>          
            </div>

            <div class="tools-section" id="tools">
                <div class="tool-container">
                    <div class="tool">
                        <h3>Zonas de Reciclaje</h3>
                        <p>Encuentra los puntos de reciclaje cercanos.</p>
                        <a href="#">Ver Mapa</a>
                    </div>
                    <div class="tool">
                        <h3>Calculadora de Huella de Carbono</h3>
                        <p>Calcula tu impacto ambiental.</p>
                        <a href="#">Calcula ahora</a>
                    </div>
                    <div class="tool">
                        <h3>Reciclaje de Residuos</h3>
                        <p>¿Dónde desechar cada residuo?</p>
                        <a href="#">Consulta aquí</a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Tools;
