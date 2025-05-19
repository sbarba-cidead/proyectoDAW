import '../../styles/RecycleGuidePage.css';

import { useState } from "react";

const productos = [
    {
        nombre: "Botella de plástico",
        materiales: ["Plástico"],
        contenedor: "Amarillo",
        imagen: "contenedor-amarillo.png",
        descripcion: "Botellas de plástico, como las de refrescos y agua."
    },
    {
        nombre: "Botella de cristal",
        materiales: ["Vidrio"],
        contenedor: "Verde",
        imagen: "contenedor-verde.png",
        descripcion: "Botellas o frascos de vidrio vacíos."
    },
    {
        nombre: "Caja de cartón",
        materiales: ["Cartón"],
        contenedor: "Azul",
        imagen: "contenedor-azul.png",
        descripcion: "Cajas de cartón, como las de cereales o envases de pizza."
    },
    {
        nombre: "Caja de madera",
        materiales: ["Madera"],
        contenedor: "Punto limpio",
        imagen: "punto-limpio.png",
        descripcion: "Las cajas de madera deben llevarse al punto limpio para su correcta gestión."
    },
    {
        nombre: "Restos de comida",
        materiales: ["Orgánico"],
        contenedor: "Marrón",
        imagen: "contenedor-marron.png",
        descripcion: "Restos de carne, pescado, frutas, verduras y cáscaras de huevo."
    },
    {
        nombre: "Pilas y baterías",
        materiales: ["Metal", "Químicos"],
        contenedor: "Contenedor de pilas",
        imagen: "contenedor-pilas.png",
        descripcion: "Depósitalas en los contenedores específicos que suelen encontrarse en supermercados o edificios públicos."
    },
    {
        nombre: "Juguetes rotos",
        materiales: ["Plástico", "Electrónica (opcional)"],
        contenedor: "Punto limpio",
        imagen: "punto-limpio.png",
        descripcion: "Los juguetes, especialmente si contienen electrónica, deben ir al punto limpio."
    },
    {
        nombre: "Compresas usadas",
        materiales: ["Desechables", "Textil"],
        contenedor: "Gris",
        imagen: "contenedor-gris.png",
        descripcion: "Este tipo de residuos no son reciclables, se deben tirar al contenedor gris (resto)."
    },
    {
        nombre: "Aceite usado",
        materiales: ["Aceite"],
        contenedor: "Punto limpio",
        imagen: "punto-limpio.png",
        descripcion: "El aceite de cocina usado debe llevarse al punto limpio en un recipiente cerrado."
    },
    {
        nombre: "Medicamentos",
        materiales: ["Farmacéuticos"],
        contenedor: "Punto SIGRE",
        imagen: "punto-sigre.png",
        descripcion: "Llévalos a los contenedores SIGRE en farmacias. No tires el blíster al amarillo ni la caja al azul, todo debe depositarse junto."
    },
    {
        nombre: "Biberones y chupetes",
        materiales: ["Plástico", "Silicona"],
        contenedor: "Gris",
        imagen: "contenedor-gris.png",
        descripcion: "Desechos de higiene no reciclables, deben ir al contenedor gris."
    },
    {
        nombre: "Cepillos de dientes",
        materiales: ["Plástico", "Silicona"],
        contenedor: "Gris",
        imagen: "contenedor-gris.png",
        descripcion: "Desechos de higiene no reciclables, deben ir al contenedor gris."
    },
    {
        nombre: "Envases de leche",
        materiales: ["Cartón", "Plástico", "Aluminio"],
        contenedor: "Amarillo",
        imagen: "contenedor-amarillo.png",
        descripcion: "Envases como los de leche, zumos, caldos, van al contenedor amarillo."
    },
    {
        nombre: "Envases de zumo",
        materiales: ["Cartón", "Plástico", "Aluminio"],
        contenedor: "Amarillo",
        imagen: "contenedor-amarillo.png",
        descripcion: "Envases como los de leche, zumos, caldos, van al contenedor amarillo."
    },
    {
        nombre: "Envases de caldo",
        materiales: ["Cartón", "Plástico", "Aluminio"],
        contenedor: "Amarillo",
        imagen: "contenedor-amarillo.png",
        descripcion: "Envases como los de leche, zumos, caldos, van al contenedor amarillo."
    },
    {
        nombre: "Bombillas",
        materiales: ["Vidrio", "Metal"],
        contenedor: "Punto limpio",
        imagen: "punto-limpio.png",
        descripcion: "Las bombillas deben desecharse en el punto limpio, no en el contenedor verde."
    },
    {
        nombre: "Corcho natural",
        materiales: ["Corcho"],
        contenedor: "Marrón",
        imagen: "contenedor-marron.png",
        descripcion: "Corchos naturales (vino, cava) se pueden tirar al contenedor marrón."
    },
    {
        nombre: "Corcho sintético",
        materiales: ["Plástico"],
        contenedor: "Amarillo",
        imagen: "contenedor-amarillo.png",
        descripcion: "Corchos sintéticos (plástico) deben ir al contenedor amarillo."
    },
    {
        nombre: "Chicles masticables",
        materiales: ["Goma sintética"],
        contenedor: "Gris",
        imagen: "contenedor-gris.png",
        descripcion: "Los chicles y gominolas no son reciclables y deben tirarse al contenedor gris."
    },
    {
        nombre: "Gominolas y chucherías",
        materiales: ["Goma sintética"],
        contenedor: "Gris",
        imagen: "contenedor-gris.png",
        descripcion: "Los chicles y gominolas no son reciclables y deben tirarse al contenedor gris."
    },
    {
        nombre: "Restos de café",
        materiales: ["Orgánico"],
        contenedor: "Marrón",
        imagen: "contenedor-marron.png",
        descripcion: "Restos de café y té son compostables y van al marrón."
    },
    {
        nombre: "Restos de infusiones",
        materiales: ["Orgánico"],
        contenedor: "Marrón",
        imagen: "contenedor-marron.png",
        descripcion: "Restos de café y té son compostables y van al marrón."
    },
    {
        nombre: "Cápculas de café",
        materiales: ["Plástico", "Orgánico"],
        contenedor: "Gris",
        imagen: "contenedor-gris.png",
        descripcion: "Cápsulas de café son no compostables y deben ir al gris."
    },
    {
        nombre: "Bolsas de té",
        materiales: ["Plástico", "Orgánico"],
        contenedor: "Gris",
        imagen: "contenedor-gris.png",
        descripcion: "Bolsas de té son no compostables y deben ir al gris."
    },
    {
        nombre: "Electrodomésticos",
        materiales: ["Electrónica", "Metal", "Plástico"],
        contenedor: "Punto limpio",
        imagen: "punto-limpio.png",
        descripcion: "Llévalos al punto limpio para su tratamiento especializado."
    },
    {
        nombre: "Estropajos y bayetas",
        materiales: ["Textil sintético"],
        contenedor: "Gris",
        imagen: "contenedor-gris.png",
        descripcion: "Estos productos de limpieza van al contenedor gris."
    },
    {
        nombre: "Paños de limpieza",
        materiales: ["Textil sintético"],
        contenedor: "Gris",
        imagen: "contenedor-gris.png",
        descripcion: "Estos productos de limpieza van al contenedor gris."
    },
    {
        nombre: "Gasas, vendas, tiritas",
        materiales: ["Textil", "Plástico"],
        contenedor: "Gris",
        imagen: "contenedor-gris.png",
        descripcion: "Desechos sanitarios no reciclables, van al gris."
    },
    {
        nombre: "Bastoncillos",
        materiales: ["Textil", "Plástico"],
        contenedor: "Gris",
        imagen: "contenedor-gris.png",
        descripcion: "Desechos sanitarios no reciclables, van al gris."
    },
    {
        nombre: "Ropa",
        materiales: ["Textil", "Cuero"],
        contenedor: "Contenedor de ropa / Punto limpio",
        imagen: "contenedor-ropa.png",
        descripcion: "Puedes depositarlos en contenedores de ropa o en el punto limpio si están muy deteriorados."
    },
    {
        nombre: "Zapatos",
        materiales: ["Textil", "Cuero"],
        contenedor: "Contenedor de ropa / Punto limpio",
        imagen: "contenedor-ropa.png",
        descripcion: "Puedes depositarlos en contenedores de ropa o en el punto limpio si están muy deteriorados."
    },
    {
        nombre: "Ordenadores",
        materiales: ["Electrónica", "Metal", "Plástico"],
        contenedor: "Punto limpio",
        imagen: "punto-limpio.png",
        descripcion: "Equipos informáticos deben ir al punto limpio para reciclaje electrónico."
    },
    {
        nombre: "Teléfonos móviles",
        materiales: ["Electrónica", "Metal", "Plástico"],
        contenedor: "Punto limpio",
        imagen: "punto-limpio.png",
        descripcion: "Teléfonos móviles deben ir al punto limpio para reciclaje electrónico."
    },
    {
        nombre: "Pelo",
        materiales: ["Orgánico no compostable"],
        contenedor: "Gris",
        imagen: "contenedor-gris.png",
        descripcion: "Aunque es natural, no es compostable: va al contenedor gris."
    },
    {
        nombre: "Sartenes y cacerolas",
        materiales: ["Metal", "Teflón"],
        contenedor: "Punto limpio",
        imagen: "punto-limpio.png",
        descripcion: "No se reciclan en contenedores comunes. Llévalas al punto limpio."
    },
    {
        nombre: "Servilletas usadas",
        materiales: ["Papel"],
        contenedor: "Marrón",
        imagen: "contenedor-marron.png",
        descripcion: "Siempre que estén sucias con restos orgánicos, van al marrón."
    },
    {
        nombre: "Toallitas húmedas",
        materiales: ["Textil sintético"],
        contenedor: "Gris",
        imagen: "contenedor-gris.png",
        descripcion: "No deben tirarse al inodoro. Van al contenedor gris."
    },
    {
        nombre: "Vasos de cristal",
        materiales: ["Cristal"],
        contenedor: "Gris",
        imagen: "contenedor-gris.png",
        descripcion: "El cristal no es reciclable en el contenedor verde. Debe ir al gris o al punto limpio."
    },      
];

// Función para eliminar tildes y normalizar texto
const normalizarTexto = (texto) => {
    return texto
      .normalize("NFD") // Descompone los caracteres acentuados
      .replace(/[\u0300-\u036f]/g, ""); // Elimina los diacríticos (tildes, acentos, etc.)
};

function RecycleGuidePage() {
    const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [resultado, setResultado] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  // Filtrar productos por nombre según lo que el usuario escribe, ignorando tildes
  const productosFiltrados = productos.filter((producto) => {
    const nombreNormalizado = normalizarTexto(producto.nombre.toLowerCase());
    const busquedaNormalizada = normalizarTexto(busqueda.toLowerCase());

    // Si la búsqueda es una sola letra, buscar productos que empiecen con esa letra
    if (busquedaNormalizada.length === 1) {
      const palabras = nombreNormalizado.split(" ");
      return palabras.some((palabra) => palabra.startsWith(busquedaNormalizada));
    }

    // Si no es una sola letra, comparar de manera más general
    return nombreNormalizado.includes(busquedaNormalizada);
  });

  // Manejar el cambio en el campo de búsqueda
  const handleBusquedaChange = (e) => {
    setBusqueda(e.target.value);
    setProductoSeleccionado(""); // Resetear selección
    setResultado(null); // Limpiar resultado
  };

  // Manejar el clic en una opción de la lista
  const handleProductoClick = (producto) => {
    setProductoSeleccionado(producto.nombre);
    setBusqueda(""); // Limpiar el campo de búsqueda
    setResultado(producto); // Mostrar la información del producto seleccionado
  };

  // Manejar la tecla "Enter"
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && productosFiltrados.length === 1) {
      const producto = productosFiltrados[0];
      setProductoSeleccionado(producto.nombre);
      setResultado(producto);
      setBusqueda(""); // Limpiar el campo de búsqueda
    }
  };

  return (
    <div className="recyclebins-container">
        {/* <h1>¿Dónde desechar mi producto?</h1> */}
        <div className="search-products-container">
            <label>Busca un producto:</label>
            <input
                type="text"
                value={busqueda}
                onChange={handleBusquedaChange}
                onKeyPress={handleKeyPress} // Detectar la tecla "Enter"
                placeholder="Escribe el nombre del producto..."
            />            

            {busqueda && productosFiltrados.length > 0 && (
                <div className="search-suggestions">
                    <ul>
                        {productosFiltrados.map((producto) => (
                        <li
                            key={producto.nombre}
                            onClick={() => handleProductoClick(producto)} // Llamar a handleProductoClick al hacer clic
                        >
                            {producto.nombre}
                        </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
        
        <div className="results-container">            
            {productoSeleccionado ? (
                <div className="result">
                    <h2>Información del producto</h2>
                    <p><strong>Producto:</strong> {resultado.nombre}</p>
                    <p><strong>Materiales:</strong> {resultado.materiales.join(", ")}</p>
                    <p><strong>Contenedor:</strong> {resultado.contenedor}</p>
                    <img src={resultado.imagen} alt={resultado.contenedor} />
                    <p>{resultado.descripcion}</p>
                </div>
            ) : (
                <p className="notice">Selecciona un producto para ver la información.</p>
            )}
        </div>
    </div>
  );
}

export default RecycleGuidePage;
