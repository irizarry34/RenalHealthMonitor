"use client"; // Añadir esta línea al principio

import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Link from 'next/link';
import '../styles/globals.css'; // Asegúrate de que esta ruta sea correcta

export default function Layout({ children }) {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });

    return () => {
      // Si authListener tiene unsubscribe, úsalo
      if (authListener && typeof authListener.unsubscribe === 'function') {
        authListener.unsubscribe();
      }
    };
  }, []);

  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-800 font-sans antialiased">
        <nav className="bg-blue-600 p-4 text-white shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">Health Monitor</h1>
            <div>
              {!session ? (
                <>
                  <Link href="/login" className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-700">
                    Login
                  </Link>
                  <Link href="/signup" className="ml-4 px-4 py-2 rounded bg-green-500 hover:bg-green-700">
                    Sign Up
                  </Link>
                </>
              ) : (
                <p className="font-semibold">Welcome, {session.user.email}!</p>
              )}
            </div>
          </div>
        </nav>
        <main className="container mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}
