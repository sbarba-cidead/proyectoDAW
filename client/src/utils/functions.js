import { format, toZonedTime } from 'date-fns-tz';

const API_URL = process.env.REACT_APP_API_URL;

// mandar una actividad de reciclaje a la api para guardar en BD
export const sendRecyclingActivity = async (type) => {
  try {
    const token = localStorage.getItem('usertoken');

    const response = await fetch(`${API_URL}/recycle/save-recycling-activity`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ type })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al guardar la actividad de reciclaje');
    }

    return data;
  } catch (error) {  throw error; }
};

// convertir fecha/hora de UTC a hora España península
// y darle formato adecuado de salida
export const convertUTCDateTime = (datetimeUTC) => {
    const spanishZone = 'Europe/Madrid';

    const datetimeLocal = toZonedTime(datetimeUTC, spanishZone);
    return format(datetimeLocal, 'dd/MM/yyyy HH:mm', { timeZone: spanishZone });
}
