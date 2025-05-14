import { useState } from 'react';
import '../styles/EcoCalc.css';

const carbonQuestions = [
    {
        id: 'carUsage',
        question: '¿Cuántos kilómetros conduces por semana?',
        options: [
            { label: '0-50 km', value: 0.2 },
            { label: '51-100 km', value: 0.5 },
            { label: '101-200 km', value: 1 },
            { label: 'Más de 200 km', value: 1.5 },
        ]
    },
    {
        id: 'flights',
        question: '¿Cuántos vuelos en avión realizas al año?',
        options: [
            { label: 'Ninguno', value: 0 },
            { label: '1-2 vuelos', value: 1 },
            { label: '3-5 vuelos', value: 2 },
            { label: 'Más de 5 vuelos', value: 3 },
        ]
    },
    {
        id: 'meat',
        question: '¿Con qué frecuencia consumes carne?',
        options: [
            { label: 'Nunca', value: 0 },
            { label: '1-2 veces por semana', value: 0.5 },
            { label: '3-5 veces por semana', value: 1 },
            { label: 'Todos los días', value: 1.5 },
        ]
    },
    {
        id: 'recycling',
        question: '¿Reciclas regularmente?',
        options: [
            { label: 'Sí', value: 0 },
            { label: 'No', value: 0.5 },
        ]
    }
];

const waterQuestions = [
    {
        id: 'showerTime',
        question: '¿Cuánto duran tus duchas diarias?',
        options: [
            { label: 'Menos de 5 min', value: 0.2 },
            { label: '5-10 min', value: 0.5 },
            { label: 'Más de 10 min', value: 1 },
        ]
    },
    {
        id: 'laundry',
        question: '¿Cuántas veces lavas ropa por semana?',
        options: [
            { label: '1 vez', value: 0.2 },
            { label: '2-3 veces', value: 0.5 },
            { label: 'Más de 3 veces', value: 1 },
        ]
    },
    {
        id: 'waterTap',
        question: '¿Cierras el grifo mientras no usas el agua?',
        options: [
            { label: 'Sí', value: 0 },
            { label: 'No', value: 1 },
            { label: 'A veces', value: 0.5 },
        ]
    },
    {
        id: 'waterCom',
        question: '¿Realizas alguna de estas actividades?',
        options: [
            { label: 'Riego con frecuencia mi jardín', value: 0.8 },
            { label: 'Dispongo de una piscina privada', value: 0.5 },
            { label: 'Dispongo de priscina y riego mi jardín', value: 1 },
            { label: 'Ninguna de las anteriores', value: 0 },
        ]
    }
];


// Valoraciones según el total de huella
const adviceLevels = [
    { max: 2, text: '¡Excelente! Tu huella ecológica es muy baja.' },
    { max: 5, text: 'Bien, pero puedes mejorar reduciendo duchas largas y vuelos.' },
    { max: Infinity, text: 'Huella alta. Considera reducir transporte, carne y consumo de agua.' },
];

// Consejos para mejorar la huella
const improvementIntro = 'Aquí tienes algunos consejos personalizados para mejorar tu impacto ecológico:';
const improvementTips = [
    'Usa bicicleta o transporte público.',
    'Reduce duchas largas.',
    'Come menos carne roja.',
    'Llena la lavadora por completo antes de usarla.',
];


function EcoCalc() {
    const [carbonAnswers, setCarbonAnswers] = useState({});
    const [waterAnswers, setWaterAnswers] = useState({});
    const [carbonFootprint, setCarbonFootprint] = useState(null);
    const [waterFootprint, setWaterFootprint] = useState(null);
    const [errors, setErrors] = useState({ carbon: false, water: false });

    const handleChange = (setter) => (e) => {
        const { name, value } = e.target;
        setter(prev => ({ ...prev, [name]: parseFloat(value) }));
    };

    const allAnswered = (answers, questions) => {
        return questions.every(q => answers.hasOwnProperty(q.id));
    };

    const calculateFootprint = (answers, questions, setter, type) => {
        if (!allAnswered(answers, questions)) {
            setErrors(prev => ({ ...prev, [type]: true }));
            setter(null);
            return;
        }
        setErrors(prev => ({ ...prev, [type]: false }));
        const total = Object.values(answers).reduce((sum, val) => sum + val, 0);
        setter(total.toFixed(2));
    };

    const getTotal = () => (
        (parseFloat(carbonFootprint || 0) + parseFloat(waterFootprint || 0)).toFixed(2)
    );

    const getAdvice = () => {
        const total = parseFloat(getTotal());
        return adviceLevels.find(level => total <= level.max)?.text || '';
    };

    const renderQuestions = (questions, answers, handleChangeFn) => (
        questions.map((q) => (
            <div className="form-group" key={q.id}>
                <label>{q.question}</label>
                <select name={q.id} value={answers[q.id] !== undefined ? answers[q.id] : ''} onChange={handleChangeFn}>
                    <option value="">Selecciona una opción</option>
                    {q.options.map((opt, idx) => (
                        <option key={idx} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
        ))
    );

    return (
        <div className="eco-calc-container">
            {/* Columna 1 - Huella de Carbono */}
            <div className="eco-column">
                <h3>Huella de Carbono</h3>
                {renderQuestions(carbonQuestions, carbonAnswers, handleChange(setCarbonAnswers))}
                <button
                    onClick={() =>
                        calculateFootprint(carbonAnswers, carbonQuestions, setCarbonFootprint, 'carbon')
                    }
                >
                    Calcular consumo
                </button>
                {errors.carbon && <p className="error">Completa todas las preguntas antes de calcular.</p>}
                {carbonFootprint && <p className="result">Resultado: {carbonFootprint} t CO₂/año</p>}
                {carbonFootprint && <p className="result info">La cantidad acordada en la Agenda 2030 de la ONU es de 3 t CO₂/año como máximo por individuo.</p>}
                {carbonFootprint && <p className="result info">La media actual en España es de 4,68 t CO₂/año por individuo.</p>}
            </div>

            {/* Columna 2 - Huella Hídrica */}
            <div className="eco-column">
                <h3>Huella Hídrica</h3>
                {renderQuestions(waterQuestions, waterAnswers, handleChange(setWaterAnswers))}
                <button
                    onClick={() =>
                        calculateFootprint(waterAnswers, waterQuestions, setWaterFootprint, 'water')
                    }
                >
                    Calcular consumo
                </button>
                {errors.water && <p className="error">Completa todas las preguntas antes de calcular.</p>}
                {waterFootprint && <p className="result">Resultado: {waterFootprint} m³/año</p>}
                {waterFootprint && <p className="result info">La cantidad acordada en la Agenda 2030 de la ONU es de 3 m³/año como máximo por individuo.</p>}
                {waterFootprint && <p className="result info">La media actual en España es de 4,68 m³/año por individuo.</p>}
            </div>

            {/* Columna 3 - Huella total */}
            <div className="eco-column">
                <h3>Total Huella Ecológica</h3>
                {(carbonFootprint && waterFootprint) ? (
                    <>
                        <p className="result">Huella de Carbono: {carbonFootprint} t CO₂/año</p>
                        <p className="result">Huella Hídrica: {waterFootprint} m³/año</p>
                        <p className="advice">{getAdvice()}</p>
                        <p>{improvementIntro}</p>
                        <ul className="tips">
                            {improvementTips.map((tip, idx) => (
                                <li key={idx}>{tip}</li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <p className="total-notice">Calcula ambas huellas para ver tu resultado total.</p>
                )}
            </div>
        </div>
    );
}

export default EcoCalc;
