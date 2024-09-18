import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

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

const GlucoseChart = ({ data }) => {
  // Verifica que los datos se reciban correctamente
  console.log('Datos de glucosa recibidos en GlucoseChart:', data);

  if (!data || data.length === 0) {
    return <p>No hay datos de glucosa disponibles.</p>;
  }

  // Configura los datos del gráfico
  const chartData = {
    labels: data.map(entry => entry.date),
    datasets: [
      {
        label: 'Glucose Levels (mg/dL)',
        data: data.map(entry => entry.glucoseLevel),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
        fill: true,
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
          maxTicksLimit: 10,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Glucose Level (mg/dL)',
        },
        beginAtZero: false,
        min: Math.min(...data.map(entry => entry.glucoseLevel)) - 10,
        max: Math.max(...data.map(entry => entry.glucoseLevel)) + 10,
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
