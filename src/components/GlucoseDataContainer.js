import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; // Ajusta la ruta según tu estructura
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import { Button } from 'react-bootstrap'; // O cualquier otro componente de botón que estés usando

const GlucoseDataContainer = () => {
  const [glucoseData, setGlucoseData] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate(); // Obtén el hook de navegación

  useEffect(() => {
    const fetchGlucoseData = async () => {
      try {
        const { data, error } = await supabase
          .from('analytes_readings') // Nombre de la tabla
          .select('glucose_level, created_at') // Selecciona los campos necesarios
          .order('created_at', { ascending: true }); // Ordena por fecha ascendente (opcional)

        if (error) {
          setErrorMessage('Error al obtener los datos.');
          console.error('Error al obtener los datos:', error);
          return;
        }

        const formattedData = data.map(entry => ({
          glucoseLevel: entry.glucose_level,  // Nivel de glucosa
          date: new Date(entry.created_at).toLocaleDateString(), // Fecha en formato legible
        }));

        setGlucoseData(formattedData); // Actualiza el estado con los datos formateados
      } catch (error) {
        setErrorMessage('Error al obtener los datos.');
        console.error('Error al obtener los datos:', error);
      }
    };

    fetchGlucoseData(); // Llama a la función para obtener los datos
  }, []);

  const handleGenerateChart = () => {
    navigate('/GlucoseChart', { state: { glucoseData } }); // Redirige con los datos
  };

  return (
    <div>
      {errorMessage ? (
        <p>{errorMessage}</p>
      ) : (
        <>
          <Button onClick={handleGenerateChart}>Generar Gráfica</Button>
        </>
      )}
    </div>
  );
};

export default GlucoseDataContainer;
