"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import CreatinineChart from '../../components/CreatinineChart';

const CreatinineChartPage = () => {
  const [creatinineData, setCreatinineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        const { session } = sessionData;

        if (!session) {
          setError('No estás autenticado. Inicia sesión para ver esta página.');
          return;
        }

        const { data, error: dataError } = await supabase
          .from('analytes_readings')
          .select('id, created_at, creatinine_level, gfr')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: true });

        if (dataError) throw dataError;

        const filteredData = data.filter(entry => entry.creatinine_level !== null && entry.gfr !== null);
        if (filteredData.length === 0) {
          setError('No hay datos de creatinina para generar la gráfica.');
          return;
        }

        const formattedData = filteredData.map(entry => ({
          id: entry.id,
          creatinineLevel: entry.creatinine_level,
          gfr: entry.gfr
            ? (typeof entry.gfr === 'string' && entry.gfr.startsWith('>') ? 90 : parseFloat(entry.gfr))
            : null,
          date: new Date(entry.created_at).toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          }).replace(',', ''), // Eliminar la coma entre fecha y hora
        }));

        setCreatinineData(formattedData);
      } catch (err) {
        setError(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const removeCreatinineEntry = async (id) => {
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

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <div className="p-4 max-w-6xl w-full bg-white shadow-md rounded-lg mt-4">
        <u><h1 className="text-2xl mb-4 text-center"><strong>CREATININE AND GFR</strong></h1></u>
        {creatinineData.length > 0 ? (
          <CreatinineChart creatinineData={creatinineData} onRemoveEntry={removeCreatinineEntry} />
        ) : (
          <p>No hay datos de creatinina para mostrar.</p>
        )}
      </div>
    </div>
  );
};

export default CreatinineChartPage;