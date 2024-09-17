import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation'; // Importa el plugin de anotaciones

// Registra los componentes necesarios para Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin // Registra el plugin de anotaciones
);

const GlucoseChart = ({ glucoseData }) => {
  // Verifica que los datos se reciban correctamente
  console.log('Datos de glucosa recibidos en GlucoseChart:', glucoseData);

  // Valida que los datos no sean nulos o indefinidos
  if (!glucoseData || glucoseData.length === 0) {
    return <p>No hay datos de glucosa disponibles.</p>;
  }

  // Configura los datos del gráfico
  const chartData = {
    labels: glucoseData.map(entry => entry.date), // Fechas de registro
    datasets: [
      {
        label: 'Glucose Levels (mg/dL)',
        data: glucoseData.map(entry => entry.glucoseLevel), // Valores de glucosa
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(75, 192, 192, 1)', // Color de los puntos
        fill: true, // Relleno debajo de la línea
      },
    ],
  };

  // Configura las opciones del gráfico
  const options = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10, // Limita el número de ticks en el eje X
        },
      },
      y: {
        title: {
          display: true,
          text: 'Glucose Level (mg/dL)',
        },
        beginAtZero: false, // No comienza desde 0
        min: Math.min(...glucoseData.map(entry => entry.glucoseLevel)) - 10, // Valor mínimo dinámico del eje Y
        max: Math.max(...glucoseData.map(entry => entry.glucoseLevel)) + 10, // Valor máximo dinámico del eje Y
      },
    },
    plugins: {
      annotation: {
        annotations: {
          line1: {
            type: 'line',
            yMin: 70,
            yMax: 70,
            borderColor: 'rgba(255, 99, 132, 0.8)',
            borderWidth: 2,
            label: {
              content: 'Min Reference (70)',
              enabled: true,
              position: 'left',
              backgroundColor: 'rgba(255, 99, 132, 0.8)',
            },
          },
          line2: {
            type: 'line',
            yMin: 100,
            yMax: 100,
            borderColor: 'rgba(54, 162, 235, 0.8)',
            borderWidth: 2,
            label: {
              content: 'Max Reference (100)',
              enabled: true,
              position: 'left',
              backgroundColor: 'rgba(54, 162, 235, 0.8)',
            },
          },
        },
      },
    },
  };

  return (
    <div>
      <h2>Glucose Levels Over Time</h2>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default GlucoseChart;
