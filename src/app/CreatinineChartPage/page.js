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
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (!session) {
          setError('No estás autenticado. Inicia sesión para ver esta página.');
          return;
        }

        const { data, error: dataError } = await supabase
          .from('analytes_readings')
          .select('created_at, creatinine_level, gfr') // Incluye gfr en la consulta
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: true });

        if (dataError) throw dataError;

        if (data.length === 0) {
          setError('No hay datos de creatinina para generar la gráfica.');
        } else {
          const formattedData = data
            .map(entry => ({
              creatinineLevel: entry.creatinine_level,
              gfr: entry.gfr
                ? (typeof entry.gfr === 'string' && entry.gfr.startsWith('>') ? 90 : parseFloat(entry.gfr))
                : null,
              date: new Date(entry.created_at).toLocaleDateString(),
            }))
            .filter(entry => entry.creatinineLevel !== null && entry.gfr !== null); // Filtra los valores nulos

          setCreatinineData(formattedData);
        }
      } catch (err) {
        setError(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <div className="p-4 max-w-lg w-full bg-white shadow-md rounded-lg mt-4">
        <h1 className="text-2xl mb-4 text-center">Creatinine Chart</h1>
        {creatinineData.length > 0 ? (
          <CreatinineChart creatinineData={creatinineData} />
        ) : (
          <p>No hay datos de creatinina para mostrar.</p>
        )}
      </div>
    </div>
  );
};

export default CreatinineChartPage;
