'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useRouter } from 'next/navigation';  // Importar el hook para redireccionar

export default function Readings() {
  const [glucose, setGlucose] = useState('');
  const [creatinine, setCreatinine] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('M');
  const [notes, setNotes] = useState('');
  const [gfr, setGfr] = useState(null);
  const [userId, setUserId] = useState(null);  // Estado para almacenar el user_id
  const router = useRouter();  // Para redirigir si no hay sesión

  // Obtener el usuario autenticado
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error obteniendo la sesión:', error);
        return;
      }
      if (!session) {
        router.push('/login'); // Redirigir al login si no hay sesión
      } else {
        setUserId(session.user.id); // Guardar el user_id en el estado
      }
    };

    fetchUser();
  }, [router]);

  // Calcular el GFR
  const calculateGFR = (creatinine, age, sex) => {
    let k = sex === 'M' ? 0.9 : 0.7;
    let e = sex === 'M' ? 1.0 : 0.7;
    return 141 * Math.min(creatinine / k, 1) ** e * Math.max(creatinine / k, 1) ** -1.209 * 0.993 ** age * (sex === 'M' ? 1 : 0.742);
  };

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
          user_id: userId,  // Insertar el user_id del usuario autenticado
          glucose_level: glucose,
          creatinine_level: creatinine,
          age: age,
          sex: sex,
          notes: notes,
          gfr: calculatedGfr,
          glucose_reference_min: 70,  // Valor mínimo de referencia para glucosa
          glucose_reference_max: 100, // Valor máximo de referencia para glucosa
          creatinine_reference_max: 1.2, // Valor máximo de referencia
          creatinine_reference_min: 0.6, // Valor mínimo de referencia
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
