import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

// Register the necessary components for Chart.js
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

const GlucoseChartWithList = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isDescending, setIsDescending] = useState(true); // New state to track sorting order

  if (!data || data.length === 0) {
    return <p>No glucose data available.</p>;
  }

  // Toggle sorting order on button click
  const toggleOrder = () => {
    setIsDescending(!isDescending);
  };

  // Sort the data by date based on the selected sorting order
  const sortedData = [...data].sort((a, b) => 
    isDescending ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date)
  );

  // Create the dataset for the chart using the sorted data
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
            ? 'rgba(255, 206, 86, 1)' // Yellow for highlighted point
            : entry.glucoseLevel < 70 || entry.glucoseLevel > 100 
              ? 'rgba(255, 99, 132, 1)' // Red for out of range
              : 'rgba(75, 192, 192, 1)' // Blue/green for in range
        ),
        pointRadius: sortedData.map((entry, index) => (hoveredIndex === index ? 10 : 5)), // Increase point size when highlighted
        fill: true,
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
          text: 'Glucose Level (mg/dL)',
        },
        beginAtZero: true,
        min: 0,
        max: 500, // Maximum value for Y axis
        ticks: {
          stepSize: 20, // Intervals of 20 (0, 20, 40, 60, ...)
        },
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

  return (
    <div className="max-w-3xl mx-auto p-5 rounded-lg shadow-lg bg-white">
      {/* Chart section */}
      <h2 className="text-center text-2xl mb-4 font-sans">Glucose Levels Over Time</h2>
      <Line data={chartData} options={options} />

      {/* Sorting button */}
      <div className="text-center my-4">
        <button
          onClick={toggleOrder}
          className="px-2 py-1 bg-bloodRed text-white rounded hover:bg-bloodRedOrgange transition duration-300"
        >
          {isDescending ? 'Show Oldest First' : 'Show Newest First'}
        </button>
      </div>

      {/* Data list section */}
      <div className="mt-5 p-3 rounded bg-gray-100 border border-gray-300">
        <h3 className="text-lg mb-2 font-sans text-center">Glucose Levels History</h3>
        <div className="overflow-auto max-h-96">
          <ul className="divide-y divide-gray-300">
            {sortedData.map((entry, index) => (
              <li
                key={index}
                className="py-4 px-5 hover:bg-gray-100 transition duration-300 ease-in-out"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-700">Date: {new Date(entry.date).toLocaleDateString()}</h4>
                    <p className="text-sm text-gray-500">
                      Glucose: <span className={`font-medium ${entry.glucoseLevel < 70 || entry.glucoseLevel > 100 ? 'text-red-500' : 'text-green-600'}`}>{entry.glucoseLevel} mg/dL</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400">Entry #{index + 1}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GlucoseChartWithList;
