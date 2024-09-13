import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-blue-600 p-6 text-white text-center">
        <h1 className="text-3xl font-bold">Health Monitor</h1>
        <p className="mt-2 text-lg">Monitor your glucose and creatinine levels to stay healthy.</p>
      </header>
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-6">
          <Image
            className="mx-auto mb-4"
            src="https://nextjs.org/icons/next.svg"
            alt="Next.js logo"
            width={120}
            height={30}
            priority
          />
          <h2 className="text-2xl font-semibold text-center mb-4">Welcome to Health Monitor</h2>
          <p className="text-gray-700 text-center mb-6">
            A modern tool to help you track your health metrics and stay on top of your wellness journey.
          </p>
          <div className="text-center">
            <Link
              href="/readings"
              className="inline-block px-6 py-3 text-white bg-blue-500 rounded hover:bg-blue-700 transition"
            >
              Go to Readings
            </Link>
          </div>
        </div>
      </main>
      <footer className="bg-blue-600 p-4 text-white text-center">
        <p>&copy; 2024 Health Monitor. All rights reserved.</p>
      </footer>
    </div>
  );
}
