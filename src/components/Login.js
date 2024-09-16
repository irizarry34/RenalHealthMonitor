"use client"; // Asegúrate de que este archivo sea un componente de cliente

import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useRouter } from 'next/navigation'; // Para redirigir al usuario después del login

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter(); // Para redirigir al usuario después del login

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Intentar loguearse con el email y contraseña ingresados
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Si hay un error en el login, mostrar el mensaje
      setError(error.message);
    } else {
      // Si el login es exitoso, redirigir a la página de lecturas
      router.push('/readings'); // Ajusta la ruta a la que quieras redirigir después del login
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-card shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-primary">Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-textPrimary">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-textPrimary">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition"
        >
          Log In
        </button>
        {error && <p className="mt-4 text-red-500">{error}</p>}
      </form>
    </div>
  );
}
