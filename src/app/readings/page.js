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
  const [creatinineData, setCreatinineData] = useState([]);
  const [chartType, setChartType] = useState('glucose'); // Estado para manejar el tipo de gráfico
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

  const fetchCreatinineData = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('analytes_readings')
      .select('created_at, creatinine_level')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching creatinine data:', error);
    } else {
      setCreatinineData(data);
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
        fetchGlucoseData();
        fetchCreatinineData();
      }
    };

    fetchUser();
  }, [router]);

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
      fetchCreatinineData();
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
    const dataToSend = chartType === 'glucose' ? glucoseData : creatinineData;
    sessionStorage.setItem('chartData', JSON.stringify(dataToSend));
    router.push(chartType === 'glucose' ? '/GlucoseChartPage' : '/CreatinineChartPage');
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
      <div className="w-full max-w-lg bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-semibold mb-6 text-center">Register Readings</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campos del formulario */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Glucose (70 - 100 mg/dL):</label>
              <input
                type="number"
                value={glucose}
                onChange={(e) => setGlucose(e.target.value)}
                className="mt-1 block w-full p-1 border border-gray-300 rounded-md shadow-sm"
                placeholder="Glucose level"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Creatinine (0.6 - 1.2 mg/dL):</label>
              <input
                type="number"
                value={creatinine}
                onChange={(e) => setCreatinine(e.target.value)}
                className="mt-1 block w-full p-1 border border-gray-300 rounded-md shadow-sm"
                placeholder="Creatinine level (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Age:</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="mt-1 block w-full p-1 border border-gray-300 rounded-md shadow-sm"
                placeholder="Age"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender:</label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value)}
                className="mt-1 block w-full p-1 border border-gray-300 rounded-md shadow-sm"
              >
                <option value="S">Select an option</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="U">Non-binary / Diverse Gender</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Comments:</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 block w-full p-1 border border-gray-300 rounded-md shadow-sm"
                placeholder="Additional notes"
              />
            </div>
          </div>
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Chart Type:</label>
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value)}
                  className="p-3 border border-gray-300 rounded-md shadow-sm"
                >
                  <option value="glucose">Glucose</option>
                  <option value="creatinine">Creatinine</option>
                </select>
              </div>
              <button
                type="button"
                onClick={handleGenerateChart}
                className="ml-4 bg-gradient-to-r from-bloodRedOrgange to-mintGreen hover:from-bloodRedOrange hover:to-mintGreen text-white px-4 py-2 rounded-lg shadow-md"
              >
                Generate Chart
              </button>

            </div>
            <button
              type="submit"
              className="mt-6 bg-bloodRed hover:bg-bloodRedOrgange text-white px-4 py-2 rounded-lg shadow-md w-full"
            >
              Save Reading
            </button>
          </div>
          {gfr && <div className="mt-4 text-center bg-gray-100 p-3 rounded-md shadow-md">Calculated GFR: {gfr}</div>}
        </form>
      </div>
    </div>
  );
}
