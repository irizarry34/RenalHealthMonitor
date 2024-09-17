import Image from 'next/image';
import Link from 'next/link';
import { Nav } from 'rsuite';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 shadow-lg rounded-lg">
      <header className="bg-mintGreen p-6 text-white text-center shadow-lg rounded-lg mt-[1rem]">
        <h1 className="text-3xl font-bold">Renal Health Monitor</h1>
        <p className="mt-2 text-lg">Monitor your glucose and creatinine levels to stay healthy.</p>
      </header>
      <main className="flex-grow flex items-center justify-center p-6 mt-[0rem]"> {/* Ajusta mt-[-4rem] según sea necesario */}
        <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg p-8"> {/* Aumenta max-w-3xl y p-8 para más tamaño */}
          <Image
            className="mx-auto mb-4 rounded-lg shadow-lg"
            src="https://vghqespckpspidfkkjjb.supabase.co/storage/v1/object/sign/SugarPatrol%20Logos/1.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJTdWdhclBhdHJvbCBMb2dvcy8xLmpwZyIsImlhdCI6MTcyNjUxNjg1NywiZXhwIjoyMDQxODc2ODU3fQ.GcPaGAFDhZXim9d6d-Mg095XujwqKfHe7PxoTLy4GKg&t=2024-09-16T20%3A00%3A57.914Z"
            alt="Next.js logo"
            width={330}
            height={90}
            priority
          />
          <h2 className="text-3xl font-semibold text-center mb-4 text-textPrimary">Welcome to Renal Health Monitor</h2> {/* Cambié text-2xl a text-3xl */}
          <p className="text-textSecondary text-center mb-6">
            A modern tool to help you track your health metrics and stay on top of your wellness journey.
          </p>
          <div className="text-center">
            <Link
              href="/readings"
              className="inline-block px-6 py-3 text-white bg-bloodRed rounded hover:bg-bloodRedOrgange transition"
            >
              Go to Readings
            </Link>
          </div>
        </div>
      </main>
      <nav className="bg-mintGreen p-4 text-white text-center shadow-lg rounded-lg">
        <p>&copy; 2024 Renal Health Monitor. All rights reserved.</p>
      </nav>
    </div>
  );
}
