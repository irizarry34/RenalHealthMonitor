import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { supabase } from '../supabaseClient';

// Register the necessary components for Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin,
  Filler
);

const GlucoseChartWithList = ({ data, setData }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isDescending, setIsDescending] = useState(true);

  if (!data || data.length === 0) {
    return <p>No glucose data available.</p>;
  }

  const toggleOrder = () => {
    setIsDescending(!isDescending);
  };

  const sortedData = [...data].sort((a, b) =>
    isDescending ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date)
  );

  const chartData = {
    labels: sortedData.map(entry => entry.date),
    datasets: [
      {
        label: 'Glucose Levels (mg/dL)',
        data: sortedData.map(entry => entry.glucoseLevel),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 2,
        pointBackgroundColor: sortedData.map((entry, index) =>
          hoveredIndex === index
            ? 'rgba(255, 206, 86, 1)' // Yellow on hover
            : entry.glucoseLevel < 70 || entry.glucoseLevel > 100
              ? 'rgba(255, 99, 132, 1)' // Red if out of range
              : 'rgba(75, 192, 192, 1)' // Green if in range
        ),
        pointRadius: sortedData.map((entry, index) => (hoveredIndex === index ? 10 : 5)),
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        title: { display: true, text: 'Date' },
        ticks: { autoSkip: true, maxTicksLimit: 10 },
      },
      y: {
        title: { display: true, text: 'Glucose Level (mg/dL)' },
        beginAtZero: true,
        min: 0,
        max: 200,
        ticks: { stepSize: 20 },
      },
    },
    plugins: {
      annotation: {
        annotations: {
          lowLevel: {
            type: 'line',
            yMin: 70,
            yMax: 70,
            borderColor: 'rgba(54, 162, 235, 0.8)',
            borderWidth: 2,
            label: {
              content: 'Low Level (70 mg/dL)',
              enabled: true,
              position: 'end',
              backgroundColor: 'rgba(54, 162, 235, 0.8)',
              color: 'white',
            },
          },
          highLevel: {
            type: 'line',
            yMin: 100,
            yMax: 100,
            borderColor: 'rgba(255, 99, 132, 0.8)',
            borderWidth: 2,
            label: {
              content: 'High Level (100 mg/dL)',
              enabled: true,
              position: 'end',
              backgroundColor: 'rgba(255, 99, 132, 0.8)',
              color: 'white',
            },
          },
        },
      },
    },
  };

  const removeEntry = async (id) => {
    const confirmation = window.confirm('Are you sure you want to delete this entry?');
    if (!confirmation) return;

    try {
      const { error } = await supabase
        .from('analytes_readings')
        .delete()
        .eq('id', id);

      if (error) throw new Error(error.message);

      // Update the main state of `data` after deletion
      const newData = data.filter(entry => entry.id !== id);
      setData(newData);
    } catch (error) {
      console.error('Error deleting the entry:', error.message);
      alert('There was an error deleting the entry. Please try again.');
    }
  };

  return (
    <div className="max-w-full mx-auto p-5 rounded-lg shadow-lg bg-white">
      
      <Line data={chartData} options={options} />

      <div className="mt-2 p-1 bg-mintGreendark text-white rounded shadow-md text-center text-xs w-48 mx-auto">
        <strong>Glucose Reference Values:</strong><br />
        70 - 100 mg/dL
      </div>

      <div className="text-center my-4">
        <button
          onClick={toggleOrder}
          className="px-2 py-1 bg-mintGreendark text-white rounded hover:bg-gradient-to-r from-bloodRedOrgange to-mintGreen transition duration-300"
        >
          {isDescending ? 'Sort Ascending' : 'Sort Descending'}
        </button>
      </div>

      <div className="overflow-x-auto mt-5 rounded-lg border border-gray-300 shadow-md">
        <table className="min-w-full bg-white rounded-lg">
          <thead className="bg-mintGreendark text-white uppercase text-sm leading-normal rounded-t-lg">
          <th colSpan="4" className="py-3 px-4 text-center text-1xl font-sans bg-mintGreendark text-white">
                GLUCOSE RECORDS:
              </th>
            <tr>
              <th className="py-3 px-4 text-left">Date and Time</th>
              <th className="py-3 px-4 text-left">Glucose Level (mg/dL)</th>
              <th className="py-3 px-4 text-center">Delete</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {sortedData.map((entry, index) => (
              <tr
                key={entry.id}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`border-b border-gray-200 hover:bg-gray-50 transition duration-200 ${hoveredIndex === index ? 'bg-gray-200' : ''}`}
              >
                <td className="py-3 px-4">{new Date(entry.date).toLocaleString()}</td>
                <td className={`py-3 px-4 ${entry.glucoseLevel < 70 || entry.glucoseLevel > 100 ? 'text-red-500' : 'text-green-600'}`}>
                  {entry.glucoseLevel} mg/dL
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    className="bg-bloodRed hover:bg-bloodRedOrgange text-white font-bold py-1 px-2 rounded transition duration-200"
                    onClick={() => removeEntry(entry.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GlucoseChartWithList;
