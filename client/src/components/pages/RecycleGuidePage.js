import '../../styles/RecycleGuidePage.css';

import { useState, useEffect } from "react";


// función para eliminar tildes y normalizar texto
const normalizarTexto = (texto) => {
    return texto
            .normalize("NFD") // descompone los caracteres acentuados
            .replace(/[\u0300-\u036f]/g, ""); // elimina los diacríticos (tildes, acentos, etc.)
};

function RecycleGuidePage() {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState("");
    const [result, setResult] = useState(null);
    const [searchData, setSearchData] = useState("");
    const apiUrl = process.env.REACT_APP_API_URL;
    const baseUrl = process.env.REACT_APP_BASE_URL;


    // se solicitan productos al backend en base al texto escrito
    useEffect(() => {
        const fetchFilteredProducts = async () => {
            if (!searchData) {
                setProducts([]); // si no hay búsqueda, no muestra nada
                return;
            }

            try {
                const res = await fetch(`${apiUrl}/recycle/eco-guide-data?search=${encodeURIComponent(searchData)}`);
                const data = await res.json();
                setProducts(data);
            } catch (error) {
                console.error("Error al buscar productos:", error);
            }
        };

        fetchFilteredProducts();
    }, [searchData, apiUrl]);

    // filtra productos por nombre según lo que el usuario escribe, ignorando tildes
    const filteredProducts = products.filter((product) => {
        const normalizedName = normalizarTexto(product.name.toLowerCase());
        const normalizedSearch = normalizarTexto(searchData.toLowerCase());

        // si la búsqueda es una sola letra, busca productos que empiecen con esa letra
        if (normalizedSearch.length === 1) {
            const words = normalizedName.split(" ");
            return words.some((word) => word.startsWith(normalizedSearch));
        }

        // si no es una sola letra, compara de manera más general
        return normalizedName.includes(normalizedSearch);
    });

    // maneja el clic en una opción de la lista
    const handleProductClick = (product) => {
        setSelectedProduct(product.name);
        setSearchData(""); // limpia el campo de búsqueda
        setResult(product); // muestra la información del producto seleccionado
    };

    // Manejar la tecla "Enter"
    const handleKeyPress = (e) => {
        if (e.key === "Enter" && filteredProducts.length === 1) {
            const product = filteredProducts[0];
            setSelectedProduct(product.name);
            setResult(product);
            setSearchData(""); // limpia el campo de búsqueda
        }
    };

    return (
        <div className="recyclebins-container">
            {/* <h1>¿Dónde desechar mi producto?</h1> */}
            <div className="search-products-container">
                <label>Busca un producto:</label>
                <input
                    type="text"
                    value={searchData}
                    onChange={(e) => setSearchData(e.target.value)}
                    onKeyDown={handleKeyPress} // detección de la tecla enter
                    placeholder="Escribe el nombre del producto..."
                />            

                {searchData && filteredProducts.length > 0 && (
                    <div className="search-suggestions">
                        <ul>
                            {filteredProducts.map((product) => (
                            <li
                                key={product.name}
                                onClick={() => handleProductClick(product)}
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

                        {/* Contenedor de columnas */}
                        <div className="columns">
                            <div className="column-left">
                                <img src={`${baseUrl}${result.productImage}`} alt={result.name} />
                            </div>
                            <div className="column-right">
                                <p>
                                    <strong>Producto:</strong> 
                                    <span className="field-value">{result.name}</span>
                                </p>
                                <p>
                                    <strong>Materiales:</strong> 
                                    <span>{result.materials.join(", ")}</span>
                                </p>
                                <div className="recyclepoint-container">
                                    <strong>Contenedor:</strong> 
                                    <div className="recyclepoint-image-container">
                                        <img src={`${baseUrl}${result.containerImage}`} alt={result.container} />
                                        <span>{result.container}</span>                                        
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="description">{result.description}</p>
                    </div>
                ) : (
                    <p className="notice">Selecciona un producto para ver la información.</p>
                )}
            </div>
        </div>
    );
}

export default RecycleGuidePage;
