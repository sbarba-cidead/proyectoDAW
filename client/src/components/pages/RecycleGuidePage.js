import 'styles/pages/RecycleGuidePage.css';

import { useState, useEffect } from "react";
import { useUserContext } from 'context/UserContext';
import { sendRecyclingActivity } from 'utils/functions';
import NotificationMessage from 'components/page-elements/NotificationMessage';


// función para normalizar texto eliminando tildes y poniendo en minúscula
const normalizeText = (text) => {
    return text
            .toLowerCase()
            .normalize("NFD") // descompone los caracteres acentuados
            .replace(/[\u0300-\u036f]/g, ""); // elimina los diacríticos (tildes, acentos, etc.)
};

function RecycleGuidePage() {
    const { user } = useUserContext();
    const [searchData, setSearchData] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productsQueryResult, setProductsQueryResult] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiUrl = process.env.REACT_APP_API_URL;
    const baseUrl = process.env.REACT_APP_BASE_URL;


    // comprobación inicial de conexión con el servidor
    useEffect(() => {
        const checkConnection = async () => {
            try {
                const res = await fetch(`${apiUrl}/recycle/ping`);
                if (!res.ok) {
                    throw new Error('Sin conexión con el servidor.');
                }
            } catch(error) {
                console.error('Error obteniendo datos:', error);
                setError('No hay conexión con el servidor:\nNo se pudieron cargar los datos. Inténtalo de nuevo');
            } finally {
                setLoading(false);
            }
        };
        checkConnection();
    }, [apiUrl]);


    // se solicitan productos al backend en base al texto escrito
    useEffect(() => {
        const fetchProducts = async () => {
            if (!searchData) {
                setProductsQueryResult([]); // si no hay búsqueda, no muestra nada
                return;
            }

            // normaliza el texto escrito por el usuario para eliminar tildes y poner en minúscula
            const normalizedSearchData = normalizeText(searchData);

            try {
                const res = await fetch(`${apiUrl}/recycle/eco-guide-data?search=${encodeURIComponent(searchData)}`);
                const data = await res.json();
                setProductsQueryResult(data); // productos que se han encontrado en coincidencia
            } catch (error) {
                console.error("Error al buscar productos:", error);
            }
        };

        fetchProducts();
    }, [searchData, apiUrl]);

    // función para guardar una nueva actividad de reciclaje
    const handleRecyclingActivity = async () =>{
        if (!user || user.banned) { return; } // si no hay usuario iniciado o está baneado no guarda la actividad

        try {
            await sendRecyclingActivity('Usar guía de reciclaje');
        } catch (error) {
            console.error('Error registrando actividad de reciclaje:', error.message);
        }
    }  

    // maneja el clic en una opción de la lista
    const handleSelectProductClick = (product) => {
        setSelectedProduct(product); // producto seleccionado de la lista
        setSearchData(""); // limpia el campo de búsqueda
        handleRecyclingActivity();
    };

    // maneja la tecla "Enter" para elegir el producto de la lista
    // sólo en caso de que sólo haya un producto como resultado
    const handleSelectProductKeyPress = (e) => {
        if (e.key === "Enter" && productsQueryResult.length === 1) {
            const product = productsQueryResult[0];
            handleSelectProductClick(product);
        }
    };


    if (loading) return <div className="recyclebins-container loading">Recuperando datos...</div>;
    if (error) return <div className="recyclebins-container">
        {<NotificationMessage
            textMessage={error}
            notificationType={"error"} />
        }
    </div>;

    return (
        <div className="recyclebins-container">
            <div className="search-products-container">
                <label>Busca un producto:</label>
                <input
                    type="text"
                    value={searchData}
                    onChange={(e) => setSearchData(e.target.value)}
                    onKeyDown={handleSelectProductKeyPress} // detección de la tecla enter
                    placeholder="Escribe el nombre del producto..."
                />            

                {searchData && productsQueryResult.length > 0 && (
                    <div className="search-suggestions">
                        <ul>
                            {productsQueryResult.map((product) => (
                            <li
                                key={product.name}
                                onClick={() => handleSelectProductClick(product)}
                            >
                                {product.name}
                            </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            
            <div className="results-container">            
                {selectedProduct ? (
                    <div className="result">
                        <h2>Información del producto</h2>

                        <div className="columns">
                            <div className="column-left">
                                <img src={`${baseUrl}${selectedProduct.productImage}`} alt={selectedProduct.name} />
                            </div>
                            <div className="column-right">
                                <p>
                                    <strong>Producto:</strong> 
                                    <span className="field-value">{selectedProduct.name}</span>
                                </p>
                                <p>
                                    <strong>Materiales:</strong> 
                                    <span>{selectedProduct.materials.join(", ")}</span>
                                </p>
                                <div className="recyclepoint-container">
                                    <strong>Contenedor:</strong> 
                                    <div className="recyclepoint-image-container">
                                        <img src={`${baseUrl}${selectedProduct.containerImage}`} alt={selectedProduct.container} />
                                        <span>{selectedProduct.container}</span>                                        
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="description">{selectedProduct.description}</p>
                    </div>
                ) : (
                    <div className="default-text">
                        <h3>¿Dónde desechar mi producto?</h3>
                        <p>Selecciona un producto para ver la información.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default RecycleGuidePage;
