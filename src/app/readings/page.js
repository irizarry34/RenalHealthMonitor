"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useRouter } from 'next/navigation';

export default function Readings() {
  const [glucose, setGlucose] = useState('');
  const [creatinine, setCreatinine] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('M');
  const [notes, setNotes] = useState('');
  const [gfr, setGfr] = useState(null);
  const [userId, setUserId] = useState(null);
  const [glucoseData, setGlucoseData] = useState([]);
  const router = useRouter();

  const fetchGlucoseData = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('analytes_readings')
      .select('created_at, glucose_level')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching glucose data:', error);
    } else {
      setGlucoseData(data);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error obteniendo la sesión:', error);
        return;
      }
      if (!session) {
        router.push('/login');
      } else {
        setUserId(session.user.id);
      }
    };

    fetchUser();
  }, [router]);

  useEffect(() => {
    if (userId) {
      fetchGlucoseData();
    }
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      alert('Usuario no autenticado');
      return;
    }

    const calculatedGfr = calculateGFR(creatinine, age, sex);

    const { data, error } = await supabase
      .from('analytes_readings')
      .insert([
        {
          user_id: userId,
          glucose_level: glucose,
          creatinine_level: creatinine,
          age: age,
          sex: sex,
          notes: notes,
          gfr: calculatedGfr,
          glucose_reference_min: 70,
          glucose_reference_max: 100,
          creatinine_reference_max: 1.2,
          creatinine_reference_min: 0.6,
        }
      ]);

    if (error) {
      console.error(error);
      alert('Error al guardar los datos');
    } else {
      setGfr(calculatedGfr);
      alert('Datos guardados exitosamente');
      fetchGlucoseData();
    }
  };

  const calculateGFR = (creatinine, age, sex) => {
    if (!creatinine) return null;
    
    let k = sex === 'M' ? 0.9 : 0.7;
    let e = sex === 'M' ? 1.0 : 0.7;
    let gfrValue = 141 * Math.min(creatinine / k, 1) ** e * Math.max(creatinine / k, 1) ** -1.209 * 0.993 ** age * (sex === 'M' ? 1 : 0.742);
    
    return gfrValue > 90 ? '>90' : gfrValue.toFixed(2);
  };

  const handleGenerateChart = () => {
    router.push('/glucose-chart-page'); // Redirige a la página de la gráfica
  };
  

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <div className="p-4 max-w-lg w-full bg-white shadow-md rounded-lg mt-4">
        <h1 className="text-2xl mb-4 text-center">Register Readings</h1>
        <form onSubmit={handleSubmit}>
          {/* Campos del formulario */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Glucose (70 - 100 mg/dL):</label>
            <input
              type="number"
              value={glucose}
              onChange={(e) => setGlucose(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              placeholder="Glucose level"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Creatinine (0.6 - 1.2 mg/dL):</label>
            <input
              type="number"
              value={creatinine}
              onChange={(e) => setCreatinine(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              placeholder="Creatinine level (optional)"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Age:</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              placeholder="Age"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Gender:</label>
            <select
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="S">Select an option</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="U">Non-binary / Diverse Gender</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Comments:</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              placeholder="Additional notes"
            />
          </div>
          <div className="mb-4 flex justify-between">
            <button type="submit" className="bg-bloodRed hover:bg-bloodRedOrange text-white px-4 py-2 rounded">Save Reading</button>
            <button
              type="button"
              onClick={handleGenerateChart}
              className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Generate Chart
            </button>
          </div>
          {gfr && <div className="mt-4 text-center bg-gray-100 p-2 rounded-md">Calculated GFR: {gfr}</div>}
        </form>
      </div>
    </div>
  );
}
