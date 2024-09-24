import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; 
import { useNavigate } from 'react-router-dom'; 

const GlucoseDataContainer = () => {
  const [glucoseData, setGlucoseData] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(true);  // Añadir estado de carga
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGlucoseData = async () => {
      try {
        setLoading(true);  // Iniciar estado de carga
        const { data, error } = await supabase
          .from('analytes_readings')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) throw new Error(error.message);

        // Formatear los datos correctamente
        const formattedData = data.map(entry => ({
          id: entry.id,
          glucoseLevel: entry.glucose_level,
          date: formatDateTime(entry.created_at),
        }));

        setGlucoseData(formattedData);
      } catch (error) {
        setErrorMessage('Error al obtener los datos: ' + error.message);
        console.error('Error al obtener los datos:', error);
      } finally {
        setLoading(false);  // Finalizar estado de carga
      }
    };

    fetchGlucoseData();
  }, []);

  // Función para formatear la fecha de forma consistente
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', { // Cambio de formato a español (opcional)
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).replace(',', ''); 
  };

  // Función para generar la gráfica con los datos actuales
  const handleGenerateChart = () => {
    if (glucoseData.length === 0) {
      alert('No hay datos para generar la gráfica.');
      return;
    }
    navigate('/GlucoseChart', { state: { glucoseData } });
  };

  // Función para eliminar una entrada de glucosa
  const removeEntry = async (id) => {
    if (!id) {
      alert('ID de la entrada no válido.');
      return;
    }

    const confirmation = window.confirm('¿Estás seguro de que deseas eliminar este registro? Esta acción es permanente.');
    if (!confirmation) return;

    try {
      console.log('Eliminando entrada con ID:', id); // Log para depuración
      const { error } = await supabase
        .from('analytes_readings')
        .delete()
        .eq('id', id);

      if (error) throw new Error(error.message);

      // Filtrar los datos eliminando la entrada con el ID correspondiente
      setGlucoseData(prevData => prevData.filter(entry => entry.id !== id));
    } catch (error) {
      console.error('Error al eliminar la entrada:', error.message);
      alert('Hubo un error al eliminar la entrada. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 rounded-lg shadow-md bg-white">
      {loading ? ( // Mostrar un mensaje de carga mientras se obtienen los datos
        <p>Cargando datos de glucosa...</p>
      ) : errorMessage ? (
        <p className="text-red-500">{errorMessage}</p>
      ) : (
        <>
          <button 
            onClick={handleGenerateChart} 
            className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
          >
            Generar Gráfica
          </button>
          {glucoseData.length === 0 ? ( // Mostrar mensaje si no hay datos disponibles
            <p>No hay datos de glucosa disponibles.</p>
          ) : (
            <ul className="divide-y divide-gray-300">
              {glucoseData.map(entry => (
                <li key={entry.id} className="py-2 flex justify-between items-center">
                  <span>
                    Fecha: {entry.date} | Glucosa: {entry.glucoseLevel} mg/dL
                  </span>
                  <button 
                    onClick={() => removeEntry(entry.id)} 
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default GlucoseDataContainer;
