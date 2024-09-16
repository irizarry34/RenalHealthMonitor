/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0044cc', // Un color azul profesional
        secondary: '#00bfae', // Un verde fresco
        background: '#f4f4f4', // Fondo claro para el cuerpo
        card: '#ffffff', // Fondo blanco para tarjetas
        textPrimary: '#333333', // Texto oscuro para contraste
        textSecondary: '#555555', // Texto secundario más claro
        mintGreen: '#20b2aa', // Verde menta claro
        mintGreendark: '#008b8b', //verde menta un poco mas oscuro
        bloodRed: '#C8102E', // Rojo sangre
        bloodRedOrgange: '#D74F3F', // Rojo Sangre tirando para anarajado
        
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'], // Fuente moderna y profesional
      },
    },
  },
  plugins: [],
}
