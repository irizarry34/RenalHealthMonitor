"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import GlucoseChart from '../../components/GlucoseChart';

const GlucoseChartPage = () => {
  const [session, setSession] = useState(null);
  const [glucoseData, setGlucoseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessionAndData = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Session:', session);
      console.log('Session Error:', sessionError);

      if (sessionError) {
        setError('Error obteniendo la sesión.');
        setLoading(false);
        return;
      }

      if (!session) {
        setError('No estás autenticado. Inicia sesión para ver esta página.');
        setLoading(false);
        return;
      }

      const { data, error: dataError } = await supabase
        .from('analytes_readings')
        .select('created_at, glucose_level')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true });

      console.log('Fetched Data:', data); // Debugging line

      if (dataError) {
        setError('Error fetching glucose data.');
        setLoading(false);
        return;
      }

      if (data.length === 0) {
        setError('No hay datos de glucosa para generar la gráfica.');
        setLoading(false);
        return;
      }

      const formattedData = data.map(entry => ({
        glucoseLevel: entry.glucose_level,
        date: new Date(entry.created_at).toLocaleDateString(),
      }));

      console.log('Formatted Glucose Data:', formattedData); // Debugging line

      setGlucoseData(formattedData);
      setLoading(false);
    };

    fetchSessionAndData();
  }, []);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <div className="p-4 max-w-lg w-full bg-white shadow-md rounded-lg mt-4">
        <h1 className="text-2xl mb-4 text-center">Glucose Chart</h1>
        {glucoseData.length > 0 ? (
          <GlucoseChart data={glucoseData} />
        ) : (
          <p>No hay datos de glucosa para mostrar.</p>
        )}
      </div>
    </div>
  );
};

export default GlucoseChartPage;
