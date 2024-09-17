// src/app/GlucoseChartPage/page.js
import React from 'react';
import GlucoseChart from '../../components/GlucoseChart'; // Ajusta la ruta según sea necesario
import { supabase } from '../../supabaseClient';

const GlucoseChartPage = async () => {
  // Obtén la sesión del usuario
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    console.error('Error obteniendo la sesión:', sessionError);
    return <p>Error obteniendo la sesión.</p>;
  }

  if (!session) {
    return <p>No estás autenticado. Inicia sesión para ver esta página.</p>;
  }

  // Obtén los datos de glucosa
  const { data, error } = await supabase
    .from('analytes_readings')
    .select('created_at, glucose_level')
    .eq('user_id', session.user.id)  // Filtra por el usuario autenticado
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching glucose data:', error);
    return <p>Error fetching glucose data.</p>;
  }

  if (data.length === 0) {
    return <p>No hay datos de glucosa para generar la gráfica.</p>;
  }

  const glucoseData = data.map(entry => ({
    glucoseLevel: entry.glucose_level,
    date: new Date(entry.created_at).toLocaleDateString(),
  }));

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <div className="p-4 max-w-lg w-full bg-white shadow-md rounded-lg mt-4">
        <h1 className="text-2xl mb-4 text-center">Glucose Chart</h1>
        <GlucoseChart data={glucoseData} />
      </div>
    </div>
  );
};

export default GlucoseChartPage;
