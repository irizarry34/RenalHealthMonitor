import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; // Ajusta la ruta según tu estructura
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import { Button } from 'react-bootstrap'; // O cualquier otro componente de botón que estés usando

const CreatinineDataContainer = () => {
  const [creatinineData, setCreatinineData] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate(); // Obtén el hook de navegación

  useEffect(() => {
    // Función para obtener los datos desde la tabla analytes_readings en Supabase
    const fetchCreatinineData = async () => {
      try {
        const { data, error } = await supabase
          .from('analytes_readings') // Nombre de la tabla
          .select('creatinine_level, gfr, created_at') // Selecciona los campos necesarios
          .order('created_at', { ascending: true }); // Ordena por fecha ascendente (opcional)

        if (error) {
          setErrorMessage('Error al obtener los datos.');
          console.error('Error al obtener los datos:', error);
          return;
        }

        // Mapea los datos para crear un formato adecuado para el gráfico
        const formattedData = data.map(entry => ({
          creatinineLevel: entry.creatinine_level, // Nivel de creatinina
          gfr: entry.gfr 
            ? (typeof entry.gfr === 'string' && entry.gfr.startsWith('>') ? 90 : parseFloat(entry.gfr))
            : null, // Maneja el caso cuando gfr es null
          date: new Date(entry.created_at).toLocaleDateString(), // Fecha en formato legible
        }));

        setCreatinineData(formattedData); // Actualiza el estado con los datos formateados
      } catch (error) {
        setErrorMessage('Error al obtener los datos.');
        console.error('Error al obtener los datos:', error);
      }
    };

    fetchCreatinineData(); // Llama a la función para obtener los datos
  }, []);

  const handleGenerateChart = () => {
    navigate('/CreatinineChartPage', { state: { creatinineData } }); // Redirige con los datos
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

export default CreatinineDataContainer;
