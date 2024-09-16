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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-800 font-sans antialiased">
        <nav className="bg-mintGreendark p-4 text-white shadow-md shadow-lg rounded-lg">
          <div className="container mx-auto flex justify-between items-center">
            {/* Botón de inicio */}
            <Link href="/" className="text-2xl font-bold text-white hover:text-bloodRedOrgange">
              Renal Health Monitor
            </Link>
            <div className="flex items-center space-x-4">
              {!session ? (
                <>
                  <Link href="/login" className="px-4 py-2 rounded bg-bloodRed hover:bg-bloodRedOrgange">
                    Login
                  </Link>
                  <Link href="/signup" className="px-4 py-2 rounded bg-bloodRed hover:bg-bloodRedOrgange">
                    SignUp
                  </Link>
                </>
              ) : (
                <>
                  <p className="font-semibold">Welcome, {session.user.email}!</p>
                  <button 
                    onClick={handleSignOut} 
                    className="px-4 py-2 rounded bg-bloodRed hover:bg-bloodRedOrgange text-white"
                  >
                    Sign Out
                  </button>
                </>
              )}
            </div>
          </div>
        </nav>
        <main className="container mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}
