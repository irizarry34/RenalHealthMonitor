import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; 
import { useNavigate } from 'react-router-dom'; 
import { Button } from 'react-bootstrap'; 

const CreatinineDataContainer = () => {
  const [creatinineData, setCreatinineData] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCreatinineData = async () => {
      try {
        const { data, error } = await supabase
          .from('analytes_readings')
          .select('*') // Trae todos los datos
          .order('created_at', { ascending: true });

        if (error) {
          throw new Error('Error al obtener los datos.');
        }

        console.log('Datos recibidos:', data);

        const formattedData = data.map(entry => ({
          id: entry.id,
          creatinineLevel: entry.creatinine_level,
          gfr: entry.gfr 
            ? (typeof entry.gfr === 'string' && entry.gfr.startsWith('>') ? 90 : parseFloat(entry.gfr))
            : null,
          date: formatDateTime(entry.created_at), // Formato de fecha y hora
        }));

        formattedData.forEach(entry => {
          if (!entry.id) {
            console.warn('Entrada sin ID:', entry);
          }
        });

        setCreatinineData(formattedData);
      } catch (error) {
        setErrorMessage(error.message);
        console.error('Error al obtener los datos:', error);
      }
    };

    fetchCreatinineData();
  }, []);

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).replace(',', ''); // Eliminar la coma entre fecha y hora
  };

  const handleGenerateChart = () => {
    // Filtra solo los datos necesarios
    const chartData = creatinineData.map(({ id, creatinineLevel, gfr, date }) => ({
      id,
      creatinineLevel,
      gfr,
      date,
    }));

    // Navega a la página de la gráfica con solo los datos necesarios
    navigate('/CreatinineChartPage', { state: { chartData } });
  };

  const removeEntry = async (id) => {
    if (!id) {
      alert('ID de la entrada no válido.');
      return;
    }

    const confirmation = window.confirm('¿Estás seguro de que deseas eliminar este registro? Esta acción es permanente.');
    if (!confirmation) return;

    try {
      const { error } = await supabase
        .from('analytes_readings')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      setCreatinineData(prevData => prevData.filter(entry => entry.id !== id));
    } catch (error) {
      console.error('Error al eliminar la entrada:', error.message);
      alert('Hubo un error al eliminar la entrada. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <div>
      {errorMessage ? (
        <p>{errorMessage}</p>
      ) : (
        <>
          <Button onClick={handleGenerateChart}>Generar Gráfica</Button>
          <ul>
            {creatinineData.map(entry => (
              <li key={entry.id}>
                Fecha: {entry.date} | Creatinina: {entry.creatinineLevel} mg/dL | GFR: {entry.gfr} ml/min/1.73 m²
                <Button onClick={() => removeEntry(entry.id)} variant="danger" className="ml-2">Eliminar</Button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default CreatinineDataContainer;