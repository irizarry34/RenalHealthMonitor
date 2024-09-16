"use client"; // Asegúrate de que este archivo sea un componente de cliente

import { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // Nombre de usuario
  const [firstName, setFirstName] = useState(''); // Nombre
  const [lastName, setLastName] = useState(''); // Primer apellido
  const [secondLastName, setSecondLastName] = useState(''); // Segundo apellido
  const [dob, setDob] = useState(''); // Fecha de nacimiento
  const [country, setCountry] = useState(''); // País
  const [town, setTown] = useState(''); // Pueblo
  const [address, setAddress] = useState(''); // Dirección
  const [postalCode, setPostalCode] = useState(''); // Código postal
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Función para verificar si el perfil de usuario ya existe en la tabla profiles
  const checkUsernameExists = async (username) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username);

      if (error) throw error;
      return data.length > 0;
    } catch (error) {
      setError(`Error al verificar el nombre de usuario: ${error.message}`);
      return false;
    }
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verificar si se ha ingresado un nombre de usuario
    if (!username) {
      setError("Por favor, ingresa un nombre de usuario.");
      return;
    }

    // Verificar si el nombre de usuario ya está en uso
    const usernameExists = await checkUsernameExists(username);
    if (usernameExists) {
      setError("El nombre de usuario ya está en uso. Por favor, elige otro.");
      return;
    }

    // Crear el usuario en Supabase con email y contraseña
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(`Error al registrar el usuario: ${signUpError.message}`);
      return;
    }

    // Obtener el ID del usuario creado
    const userId = data?.user?.id;

    // Verificar si se obtuvo el ID del usuario
    if (!userId) {
      setError("No se pudo obtener el ID del usuario.");
      return;
    }

    // Insertar el perfil del usuario en la tabla profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId, // Asegúrate de usar el ID correcto obtenido del auth
          username,
          first_name: firstName,
          last_name: lastName,
          second_last_name: secondLastName,
          date_of_birth: dob,
          country,
          town,
          address,
          postal_code: postalCode
        }
      ]);

    if (profileError) {
      setError(`Error al insertar el perfil: ${profileError.message}`);
    } else {
      setSuccess('Registro exitoso');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-card shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-secondary">Sign Up</h2>
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
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-textPrimary">Username</label>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-textPrimary">First Name</label>
          <input
            type="text"
            placeholder="Enter your first name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-textPrimary">Last Name</label>
          <input
            type="text"
            placeholder="Enter your last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-textPrimary">Second Last Name</label>
          <input
            type="text"
            placeholder="Enter your second last name"
            value={secondLastName}
            onChange={(e) => setSecondLastName(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-textPrimary">Date of Birth</label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-textPrimary">Country</label>
          <input
            type="text"
            placeholder="Enter your country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-textPrimary">Town</label>
          <input
            type="text"
            placeholder="Enter your town"
            value={town}
            onChange={(e) => setTown(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-textPrimary">Address</label>
          <input
            type="text"
            placeholder="Enter your address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-textPrimary">Postal Code</label>
          <input
            type="text"
            placeholder="Enter your postal code"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-secondary text-white py-2 px-4 rounded-md hover:bg-bloodRedOrgange transition"
        >
          Sign Up
        </button>
        {error && <p className="mt-4 text-red-500">{error}</p>}
        {success && <p className="mt-4 text-green-500">{success}</p>}
      </form>
    </div>
  );
}
