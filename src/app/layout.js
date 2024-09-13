"use client"; // Asegúrate de que este archivo sea un componente de cliente

import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Link from 'next/link';
import '../styles/globals.css'; // Asegúrate de que la ruta es correcta

export default function Layout({ children }) {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });

    // No se utiliza unsubscribe, ya que no es necesario en este caso
    return () => {
      // Cleanup no necesario si authListener no tiene unsubscribe
    };
  }, []);

  return (
    <html lang="en">
      <body>
        <nav className="bg-primary p-4 text-white">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">Health Monitor</h1>
            <div>
              {!session ? (
                <>
                  <Link href="/login" className="hover:underline">
                    Login
                  </Link>
                  <Link href="/signup" className="ml-4 hover:underline">
                    Sign Up
                  </Link>
                </>
              ) : (
                <p>Welcome, {session.user.email}!</p>
              )}
            </div>
          </div>
        </nav>
        <main className="container mx-auto p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
