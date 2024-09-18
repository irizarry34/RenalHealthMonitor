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
  annotationPlugin
);

const CreatinineChart = ({ creatinineData }) => {
  console.log('Datos de creatinina recibidos en CreatinineChart:', creatinineData);

  if (!creatinineData || creatinineData.length === 0) {
    return <p>No hay datos de creatinina disponibles.</p>;
  }

  // Crear los datasets de creatinina y GFR
  const chartData = {
    labels: creatinineData.map(entry => entry.date),
    datasets: [
      {
        label: 'Creatinine Levels (mg/dL)',
        data: creatinineData.map(entry => entry.creatinineLevel),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(255, 99, 132, 1)',
        fill: true,
      },
      {
        label: 'GFR (ml/min/1.73 m²)',
        data: creatinineData.map(entry => entry.gfr !== null && entry.gfr !== undefined ? entry.gfr : 0), // Manejar valores null y undefined
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        fill: false, // Cambiado a false para solo mostrar la línea
        yAxisID: 'y1', // Se le asigna un eje Y diferente
      },
    ],
  };

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
          text: 'Creatinine Level (mg/dL)',
        },
        beginAtZero: false,
        min: Math.min(...creatinineData.map(entry => entry.creatinineLevel)) - 10,
        max: Math.max(...creatinineData.map(entry => entry.creatinineLevel)) + 10,
      },
      y1: { // Segundo eje Y para el GFR
        position: 'right',
        title: {
          display: true,
          text: 'GFR (ml/min/1.73 m²)',
        },
        beginAtZero: false,
        min: 0,
        max: Math.max(...creatinineData.map(entry => entry.gfr !== null && entry.gfr !== undefined ? entry.gfr : 0)) + 10,
      },
    },
    plugins: {
      annotation: {
        annotations: {
          line1: {
            type: 'line',
            yMin: 0.8,
            yMax: 0.8,
            borderColor: 'rgba(255, 99, 132, 0.8)',
            borderWidth: 2,
            label: {
              content: 'Min Reference (0.8)',
              enabled: true,
              position: 'left',
              backgroundColor: 'rgba(255, 99, 132, 0.8)',
            },
          },
          line2: {
            type: 'line',
            yMin: 1.2,
            yMax: 1.2,
            borderColor: 'rgba(54, 162, 235, 0.8)',
            borderWidth: 2,
            label: {
              content: 'Max Reference (1.2)',
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
      <h2>Creatinine and GFR Levels Over Time</h2>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default CreatinineChart;
