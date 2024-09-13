'use client';

import { useState } from 'react';
import { supabase } from '../../supabaseClient';

export default function Readings() {
  const [glucose, setGlucose] = useState('');
  const [creatinine, setCreatinine] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('M');
  const [notes, setNotes] = useState('');
  const [gfr, setGfr] = useState(null);

  const calculateGFR = (creatinine, age, sex) => {
    let k = sex === 'M' ? 0.9 : 0.7;
    let e = sex === 'M' ? 1.0 : 0.7;
    return 141 * Math.min(creatinine / k, 1) ** e * Math.max(creatinine / k, 1) ** -1.209 * 0.993 ** age * (sex === 'M' ? 1 : 0.742);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const calculatedGfr = calculateGFR(creatinine, age, sex);

    const { data, error } = await supabase
      .from('analytes_readings')
      .insert([
        {
          glucose_level: glucose,
          creatinine_level: creatinine,
          age: age,
          sex: sex,
          notes: notes,
          gfr: calculatedGfr,
          reference_glucose_range: '70-100 mg/dL',
          reference_creatinine_range: '0.6-1.2 mg/dL'
        }
      ]);

    if (error) {
      console.error(error);
      alert('Error al guardar los datos');
    } else {
      setGfr(calculatedGfr);
      alert('Datos guardados exitosamente');
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl mb-4">Registro de Lecturas</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Glucosa</label>
          <input
            type="number"
            value={glucose}
            onChange={(e) => setGlucose(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            placeholder="Nivel de glucosa"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Creatinina</label>
          <input
            type="number"
            value={creatinine}
            onChange={(e) => setCreatinine(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            placeholder="Nivel de creatinina"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Edad</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            placeholder="Edad"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Sexo</label>
          <select
            value={sex}
            onChange={(e) => setSex(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Comentarios</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            placeholder="Notas adicionales"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Guardar Lectura</button>
        {gfr && <div className="mt-4">GFR Calculado: {gfr.toFixed(2)}</div>}
      </form>
    </div>
  );
}
