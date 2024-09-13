// src/app/page.js
"use client";

import Image from 'next/image';
import Link from 'next/link'; // Importa Link de next/link

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-blue-900 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Image src="/logo.svg" alt="Logo" width={150} height={50} />
          <nav className="space-x-4">
            <Link href="/readings">Registro de Lecturas</Link>
            <Link href="/login">Login</Link>
            <Link href="/signup">Sign Up</Link>
          </nav>
        </div>
      </header>
      <main className="flex-grow flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Bienvenido a Health Monitor</h1>
          <p className="text-lg mb-6">Monitorea tus niveles de glucosa y creatinina para mantenerte saludable.</p>
          <Link href="/readings">
            <button className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">Ir a Registro de Lecturas</button>
          </Link>
        </div>
      </main>
      <footer className="bg-blue-900 text-white p-4 text-center">
        <p>&copy; {new Date().getFullYear()} Health Monitor. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
