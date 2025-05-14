import '../styles/Tools.css';

function Tools() {
    return (
        <div className="tools-container">
            <div className="tool">
                <h3>Zonas de Reciclaje</h3>
                <p>Encuentra los puntos de reciclaje cercanos.</p>
                <a href="#">Ver Mapa</a>
            </div>
            <div className="tool">
                <h3>Calculadora de <br /> Huella de Carbono</h3>
                <p>Calcula tu impacto ambiental.</p>
                <a href="#">Calcula ahora</a>
            </div>
            <div className="tool">
                <h3>Reciclaje de Residuos</h3>
                <p>¿Dónde desechar cada residuo?</p>
                <a href="#">Consulta aquí</a>
            </div>
        </div>
    );
}

export default Tools;
