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
  const [chartType, setChartType] = useState('glucose');
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

    // Convertir los valores a número y validar
    const glucoseNum = glucose !== '' ? parseFloat(glucose) : null; // Glucosa opcional
    const creatinineNum = creatinine !== '' ? parseFloat(creatinine) : null;
    const ageNum = age !== '' ? parseInt(age) : null;

    if (!isValidNumber(creatinineNum) || !isValidNumber(ageNum)) {
      alert('Por favor, ingrese valores válidos numéricos positivos.');
      return;
    }

    const calculatedGfr = calculateGFR(creatinineNum, ageNum, sex);

    const { data, error } = await supabase
      .from('analytes_readings')
      .insert([
        {
          user_id: userId,
          glucose_level: glucoseNum, // Se puede insertar como null
          creatinine_level: creatinineNum,
          age: ageNum,
          sex: sex,
          notes: notes,
          gfr: calculatedGfr,
          glucose_reference_min: glucoseNum !== null ? 70 : null,  // Solo si se proporciona un valor de glucosa
          glucose_reference_max: glucoseNum !== null ? 100 : null,
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

      // Restablecer los campos a valores en blanco o predeterminados
      setGlucose('');      // Vaciar campo de glucosa
      setCreatinine('');   // Vaciar campo de creatinina
      setAge('');          // Vaciar campo de edad
      setSex('M');         // Restablecer el sexo al valor predeterminado (M)
      setNotes('');        // Vaciar el campo de notas
    }
  };

  const isValidNumber = (value) => {
    return value === null || (typeof value === 'number' && !isNaN(value) && value >= 0);
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
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Glucose (70 - 100 mg/dL):</label>
              <input
                type="number"
                value={glucose}
                onChange={(e) => setGlucose(e.target.value)}
                className="mt-1 block w-full p-1 border border-gray-300 rounded-md shadow-sm"
                placeholder="Glucose level (optional)"
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
                className="ml-4 bg-gradient-to-r from-bloodRedOrgange to-mintGreen hover:from-bloodRedOrgange hover:to-mintGreen text-white px-4 py-2 rounded-lg shadow-md"
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
          {gfr && (
            <div className="mt-4 w-full flex justify-center">
              <div className="bg-gradient-to-r from-bloodRedOrgange to-mintGreen p-3 rounded-md shadow-md animate-lightEffect border-2 border-transparent">
                Calculated GFR: {gfr}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
