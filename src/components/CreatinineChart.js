import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

// Register necessary components for Chart.js
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

const CreatinineGFRCharts = ({ creatinineData }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null); // State to track hovered index
  const [isDescending, setIsDescending] = useState(true); // State to track sorting order
  const [filteredData, setFilteredData] = useState(creatinineData); // State for filtered data

  if (!filteredData || filteredData.length === 0) {
    return <p>No creatinine data available.</p>;
  }

  // Toggle sorting order on button click
  const toggleOrder = () => {
    setIsDescending(!isDescending);
  };

  // Sort the data by date based on the selected sorting order
  const sortedData = [...filteredData].sort((a, b) =>
    isDescending ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date)
  );

  // Creatinine chart data
  const creatinineChartData = {
    labels: sortedData.map(entry => entry.date),
    datasets: [
      {
        label: 'Creatinine Levels (mg/dL)',
        data: sortedData.map(entry => entry.creatinineLevel),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderWidth: 2,
        pointBackgroundColor: sortedData.map((entry, index) =>
          hoveredIndex === index
            ? 'rgba(255, 206, 86, 1)' // Yellow for highlighted point
            : entry.creatinineLevel < 0.8 || entry.creatinineLevel > 1.2
              ? 'rgba(255, 99, 132, 1)' // Red for out of range
              : 'rgba(75, 192, 192, 1)' // Blue/green for in range
        ),
        pointRadius: sortedData.map((entry, index) => (hoveredIndex === index ? 10 : 5)), // Increase point size when highlighted
        fill: true,
      },
    ],
  };

  // GFR chart data
  const gfrChartData = {
    labels: sortedData.map(entry => entry.date),
    datasets: [
      {
        label: 'GFR (ml/min/1.73 m²)',
        data: sortedData.map(entry => (entry.gfr !== null && entry.gfr !== undefined ? entry.gfr : 0)), // Handle null/undefined GFR values
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderWidth: 2,
        pointBackgroundColor: sortedData.map((entry, index) =>
          hoveredIndex === index ? 'rgba(255, 206, 86, 1)' : 'rgba(54, 162, 235, 1)' // Yellow when highlighted
        ),
        pointRadius: sortedData.map((entry, index) => (hoveredIndex === index ? 10 : 5)), // Increase point size when highlighted
        fill: true,
      },
    ],
  };

  // Common chart options
  const commonOptions = {
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
    },
    plugins: {
      annotation: {
        annotations: {
          line1: {
            type: 'line',
            yMin: 1.2,
            yMax: 1.2,
            borderColor: 'rgba(255, 99, 132, 0.8)', // Red for Max Reference
            borderWidth: 2,
            label: {
              content: 'Max Reference (1.2)',
              enabled: true,
              position: 'left',
              backgroundColor: 'rgba(255, 99, 132, 0.8)',
              color: 'white',
            },
          },
          line2: {
            type: 'line',
            yMin: 0.8,
            yMax: 0.8,
            borderColor: 'rgba(54, 162, 235, 0.8)', // Blue for Min Reference
            borderWidth: 2,
            label: {
              content: 'Min Reference (0.8)',
              enabled: true,
              position: 'left',
              backgroundColor: 'rgba(54, 162, 235, 0.8)',
              color: 'white',
            },
          },
        },
      },
    },
  };

  // Function to remove an entry based on type
  const removeEntry = (index, type) => {
    const newFilteredData = filteredData.filter((entry, i) => {
      if (type === 'creatinine') {
        return i !== index; // Remove creatinine entry
      } else if (type === 'gfr') {
        return entry.gfr !== filteredData[index].gfr; // Remove GFR entry based on its value
      }
      return true;
    });
    setFilteredData(newFilteredData);
  };

  return (
    <div className="max-w-6xl mx-auto p-10 rounded-lg shadow-lg bg-white">
      <h2 className="text-center text-2xl mb-4 font-sans">Creatinine and GFR Levels Over Time</h2>

      {/* Flexbox container to align charts side by side with more space */}
      <div className="flex justify-between">
        {/* Creatinine Chart */}
        <div className="w-1/2 pr-4">
          <Line
            data={creatinineChartData}
            options={{
              ...commonOptions,
              scales: {
                ...commonOptions.scales,
                y: {
                  title: {
                    display: true,
                    text: 'Creatinine Level (mg/dL)',
                  },
                  beginAtZero: true,
                  min: 0,
                  max: 20, // Máximo ajustado a 20
                  ticks: {
                    stepSize: 1, // Ajuste de stepSize a 1
                  },
                },
              },
            }}
          />
        </div>

        {/* GFR Chart */}
        <div className="w-1/2 pl-4">
          <Line
            data={gfrChartData}
            options={{
              ...commonOptions,
              scales: {
                ...commonOptions.scales,
                y: {
                  title: {
                    display: true,
                    text: 'GFR (ml/min/1.73 m²)',
                  },
                  beginAtZero: true,
                  min: 0,
                  max: 100, // Fixed maximum for GFR
                  ticks: {
                    stepSize: 10,
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Sorting button */}
      <div className="text-center my-4">
        <button
          onClick={toggleOrder}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-300"
        >
          {isDescending ? 'Show Oldest First' : 'Show Newest First'}
        </button>
      </div>

      {/* Data list section */}
      <div className="mt-5 p-3 rounded bg-gray-100 border border-gray-300">
        <h3 className="text-lg mb-2 font-sans text-center">Creatinine and GFR Levels History</h3>
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
                      Creatinine: <span className={`font-medium ${entry.creatinineLevel < 0.8 || entry.creatinineLevel > 1.2 ? 'text-red-500' : 'text-green-600'}`}>{entry.creatinineLevel} mg/dL</span>
                      <button
                        onClick={() => removeEntry(index, 'creatinine')}
                        className="ml-2 text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </p>
                    {entry.gfr && (
                      <p className="text-sm text-gray-500">
                        GFR: <span className="font-medium text-blue-600">{entry.gfr} ml/min/1.73 m²</span>
                        <button
                          onClick={() => removeEntry(index, 'gfr')}
                          className="ml-2 text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </p>
                    )}
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

export default CreatinineGFRCharts;
