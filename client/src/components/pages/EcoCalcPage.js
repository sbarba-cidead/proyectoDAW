import '../../styles/EcoCalcPage.css';

import { useState, useEffect } from 'react';

const improvementIntro = 'Aquí tienes algunos consejos personalizados para mejorar tu impacto ecológico:';

function EcoCalcPage() {
    const [carbonQuestions, setCarbonQuestions] = useState([]);
    const [waterQuestions, setWaterQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [carbonAnswers, setCarbonAnswers] = useState({});
    const [waterAnswers, setWaterAnswers] = useState({});
    const [adviceLevels, setAdviceLevels] = useState(null);
    const [improvementRules, setImprovementRules] = useState(null);
    const [personalizedTips, setPersonalizedTips] = useState(null);
    const [carbonFootprint, setCarbonFootprint] = useState(null);
    const [waterFootprint, setWaterFootprint] = useState(null);
    const [errors, setErrors] = useState({ carbon: false, water: false });
    const apiUrl = process.env.REACT_APP_API_URL;

    // se obtienen los datos de las preguntas para crear los formularios
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await fetch(`${apiUrl}/recycle/eco-questions?categories=carbon-calc,water-calc`)

                const allData = await response.json();
                const dataCarbon = allData.filter(q => q.category === 'carbon-calc');
                const dataWater = allData.filter(q => q.category === 'water-calc');

                setCarbonQuestions(dataCarbon);
                setWaterQuestions(dataWater);
                setLoading(false);
            } catch (error) {
                console.error("Error obteniendo las preguntas: ", error);
                setLoading(false);
            }
        };
        fetchQuestions();
    }, []);

    //
    useEffect(() => {
        const fetchAdviceData = async () => {
            try {
                const [adviceRes, rulesRes] = await Promise.all([
                    fetch(`${apiUrl}/recycle/eco-advice-levels`),
                    fetch(`${apiUrl}/recycle/eco-improvement-rules`)
                ]);

                setAdviceLevels(await adviceRes.json());
                setImprovementRules(await rulesRes.json());
            } catch (error) {
                console.error("Error obteniendo las preguntas: ", error);
            }
        };
        fetchAdviceData();
    }, []);

    // reinicio de los formularios para nuevo cálculo
    const handleReset = () => {
        setCarbonAnswers({});
        setWaterAnswers({});
        setCarbonFootprint(null);
        setWaterFootprint(null);
        setErrors({ carbon: false, water: false });
    };

    const handleChange = (setter) => (e) => {
        const { name, value } = e.target;
        setter(prev => ({ ...prev, [name]: parseFloat(value) }));
    };

    const allAnswered = (answers, questions) => {
        return questions.every(q => answers.hasOwnProperty(q.id));
    };

    // cálculo parcial de huella hídrica o carbono
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

    // cálculo total de huella ecológica
    const getTotal = () => (
        (parseFloat(carbonFootprint || 0) + parseFloat(waterFootprint || 0)).toFixed(2)
    );

    // consejos personalizados en función del nivel de huella
    const getAdvice = () => {
        const total = parseFloat(getTotal());
        return adviceLevels.find(level => total <= level.max)?.text || '';
    };

    // reglas para cálculo de consejos personalizados
    const getPersonalizedTips = () => {
        const allAnswers = { ...carbonAnswers, ...waterAnswers };

        const tips = improvementRules
            .filter(rule => {
                // respuestas del usuario
                const answer = allAnswers[rule.questionId];
                if (answer === undefined) return false; // si no hay respuestas

                switch (rule.operator) { // reglas de cálculo
                    case 'eq': return answer === rule.value; // igual
                    case 'gt': return answer > rule.value; // mayor
                    case 'gte': return answer >= rule.value; // mayor o igual
                    case 'lt': return answer < rule.value; // menor
                    case 'lte': return answer <= rule.value; // menor o igual
                    default: return false;
                }
            })
            .map(rule => rule.tip); // consejo personalizado

        setPersonalizedTips(tips);
    };


    // generador de los formularios a partir de los datos
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

    if (loading) return <div className="loading"></div>;

    return (
        <div className="eco-calc-container">
            {/* Columna 1 - Huella de Carbono */}
            <div className="eco-column">
                <h3>Huella de Carbono</h3>
                {renderQuestions(carbonQuestions, carbonAnswers, handleChange(setCarbonAnswers))}
                <button
                    onClick={() => {
                        calculateFootprint(carbonAnswers, carbonQuestions, setCarbonFootprint, 'carbon');
                        getPersonalizedTips();
                    }}
                >
                    Calcular consumo
                </button>
                {errors.carbon && <p className="error">Completa todas las preguntas antes de calcular.</p>}
                {carbonFootprint && [
                    <p className="result">Resultado: {carbonFootprint} t CO₂/año</p>,
                    <p className="result info">La cantidad acordada en la Agenda 2030 de la ONU es de 3 t CO₂/año como máximo por individuo.</p>,
                    <p className="result info">La media actual en España es de 4,68 t CO₂/año por individuo.</p>,
                    <div className="result div-line" />,
                    <p className="result info sub">Más información:</p>,
                    <a href="https://www.esagua.es/calculo-de-la-huella-hidrica/" className="result info link">¿Qué es la huella hídrica? </a>,
                ]}                
            </div>

            {/* Columna 2 - Huella Hídrica */}
            <div className="eco-column">
                <h3>Huella Hídrica</h3>
                {renderQuestions(waterQuestions, waterAnswers, handleChange(setWaterAnswers))}
                <button
                    onClick={() => {
                        calculateFootprint(waterAnswers, waterQuestions, setWaterFootprint, 'water');
                        getPersonalizedTips();
                    }}
                >
                    Calcular consumo
                </button>
                {errors.water && <p className="error">Completa todas las preguntas antes de calcular.</p>}
                {waterFootprint &&  [
                    <p className="result">Resultado: {waterFootprint} m³/año</p>,
                    <p className="result info">La cantidad acordada en la Agenda 2030 de la ONU es de 3 m³/año como máximo por individuo.</p>,
                    <p className="result info">La media actual en España es de 4,68 m³/año por individuo.</p>,
                    <div className="result div-line" />,
                    <p className="result info sub">Más información:</p>,
                    <a href="https://calculatuhuella.consumo.gob.es/" className="result info link">Huella de carbono ciudadana</a>,
                    <a href="https://www.miteco.gob.es/es/cambio-climatico/temas/mitigacion-politicas-y-medidas/calculadoras.html" className="result info link">Huella de carbono empresarial</a>,
                    <a href="https://serviciosempresariales.camaramadrid.es/sostenibilidad/calcula-huella-carbono/" className="result info link">Cámara de comercio</a>
                ]}
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
                            {personalizedTips.map((tip, idx) => (
                                <li key={idx}>{tip}</li>
                            ))}
                        </ul>
                        <button className="reset-button" onClick={handleReset}>
                            Calcular de nuevo
                        </button>
                    </>
                ) : (
                    <p className="total-notice">Calcula ambas huellas para ver tu resultado total.</p>
                )}
            </div>
        </div>
    );
}

export default EcoCalcPage;
