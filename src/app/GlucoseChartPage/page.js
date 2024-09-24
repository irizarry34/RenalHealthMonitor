"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import GlucoseChart from '../../components/GlucoseChart';
import Head from 'next/head';

const GlucoseChartPage = () => {
  const [session, setSession] = useState(null);
  const [glucoseData, setGlucoseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessionAndData = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !sessionData.session) {
          throw new Error('Error obteniendo la sesión. Inicia sesión para ver los datos.');
        }

        setSession(sessionData.session);

        const { data, error: dataError } = await supabase
          .from('analytes_readings')
          .select('id, created_at, glucose_level')
          .eq('user_id', sessionData.session.user.id)
          .order('created_at', { ascending: true });

        if (dataError) {
          throw new Error('Error al obtener los datos de glucosa.');
        }

        if (data.length === 0) {
          throw new Error('No hay datos de glucosa disponibles.');
        }

        const formattedData = data.map(entry => ({
          id: entry.id,
          glucoseLevel: entry.glucose_level,
          date: new Date(entry.created_at).toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
        }));

        setGlucoseData(formattedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionAndData();
  }, []);

  // Función para eliminar una entrada de glucosa
  const removeGlucoseEntry = async (id) => {
    const confirmation = window.confirm('¿Estás seguro de que deseas eliminar este registro? Esta acción es permanente.');
    if (!confirmation) return;

    try {
      const { error } = await supabase
        .from('analytes_readings')
        .delete()
        .eq('id', id);

      if (error) throw new Error(error.message);

      setGlucoseData(prevData => prevData.filter(entry => entry.id !== id));
    } catch (error) {
      console.error('Error al eliminar la entrada:', error.message);
      alert('Hubo un error al eliminar la entrada. Por favor, inténtalo de nuevo.');
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Montserrat:wght@400;700&display=swap" rel="stylesheet" />
      </Head>
      <div className="p-4 max-w-lg w-full bg-white shadow-md rounded-lg mt-4">
        <u><h1 className="text-2xl mb-4 text-center"><strong>GLUCOSE</strong></h1></u>
        {glucoseData.length > 0 ? (
          <GlucoseChart data={glucoseData} setData={setGlucoseData} onRemoveEntry={removeGlucoseEntry} />
        ) : (
          <p>No hay datos de glucosa para mostrar.</p>
        )}
      </div>
    </div>
  );
};

export default GlucoseChartPage;
