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
  Filler,
  annotationPlugin
);

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).replace(',', ''); // Remove the comma between date and time
};

const CreatinineChart = ({ creatinineData }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isDescending, setIsDescending] = useState(true);
  const [filteredData, setFilteredData] = useState(creatinineData);

  // Check if there are data entries and handle the case when there are none
  if (!filteredData || filteredData.length === 0) {
    return <p>No creatinine data available.</p>;
  }

  const toggleOrder = () => {
    setIsDescending(!isDescending);
  };

  const sortedData = [...filteredData].sort((a, b) =>
    isDescending ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date)
  );

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
            ? 'rgba(255, 206, 86, 1)'
            : entry.creatinineLevel < 0.8 || entry.creatinineLevel > 1.2
              ? 'rgba(255, 99, 132, 1)'
              : 'rgba(75, 192, 192, 1)'
        ),
        pointRadius: sortedData.map((entry, index) => (hoveredIndex === index ? 10 : 5)),
        fill: true,
      },
    ],
  };

  const gfrChartData = {
    labels: sortedData.map(entry => entry.date),
    datasets: [
      {
        label: 'GFR (ml/min/1.73 m²)',
        data: sortedData.map(entry => (entry.gfr !== null && entry.gfr !== undefined ? entry.gfr : 0)),
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderWidth: 2,
        pointBackgroundColor: sortedData.map((entry, index) =>
          hoveredIndex === index ? 'rgba(255, 206, 86, 1)' : 'rgba(54, 162, 235, 1)'
        ),
        pointRadius: sortedData.map((entry, index) => (hoveredIndex === index ? 10 : 5)),
        fill: true,
      },
    ],
  };

  const normalRangeMax = Math.max(1.2, ...sortedData.map(entry => entry.creatinineLevel));
  const creatinineYAxisMax = normalRangeMax > 1.2 ? Math.ceil(normalRangeMax * 20) / 20 : 2;

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
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Creatinine Level (mg/dL)',
        },
        min: 0.75,
        max: creatinineYAxisMax,
        ticks: {
          stepSize: 0.05,
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
            borderColor: 'rgba(255, 99, 132, 0.8)',
            borderWidth: 2,
            label: {
              content: 'Maximum Reference (1.2)',
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
            borderColor: 'rgba(54, 162, 235, 0.8)',
            borderWidth: 2,
            label: {
              content: 'Minimum Reference (0.8)',
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

  const removeEntry = async (id) => {
    const entryToRemove = filteredData.find(entry => entry.id === id);

    const confirmation = window.confirm(`Are you sure you want to permanently delete this entry?`);
    if (!confirmation) return;

    try {
      if (!entryToRemove.id) {
        throw new Error('Undefined entry ID');
      }

      const { error } = await supabase
        .from('analytes_readings')
        .delete()
        .eq('id', entryToRemove.id);

      if (error) {
        throw new Error(error.message);
      }

      const newFilteredData = filteredData.filter(entry => entry.id !== id);
      setFilteredData(newFilteredData);
      alert('Entry deleted successfully.');
    } catch (error) {
      console.error('Error deleting entry:', error.message);
      alert('There was an error deleting the entry. Please try again.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-10 rounded-lg shadow-lg bg-white">
      <div className="flex justify-between">
        {/* Creatinine Chart */}
        <div className="w-1/2 pr-4">
          <Line data={creatinineChartData} options={commonOptions} />
          <div className="mt-2 p-1 bg-mintGreendark text-white rounded shadow-md text-center text-xs w-48 mx-auto">
            <u><strong>Creatinine Reference Values:</strong><br /></u>
            0.8 - 1.2 (Men)<br />
            0.6 - 1.2 (Women)
          </div>
        </div>

        {/* GFR Chart */}
        <div className="w-1/2 pl-4">
          <Line
            data={gfrChartData}
            options={{
              ...commonOptions,
              plugins: {
                annotation: {
                  annotations: {}, // No reference lines
                },
              },
              scales: {
                ...commonOptions.scales,
                y: {
                  title: {
                    display: true,
                    text: 'GFR (ml/min/1.73 m²)',
                  },
                  min: 0,
                  max: Math.max(...sortedData.map(entry => entry.gfr || 0)) + 10,
                  ticks: {
                    stepSize: 10,
                  },
                },
              },
            }}
          />
          <div className="mt-2 p-1 bg-mintGreendark text-white rounded shadow-md text-center text-xs w-48 mx-auto">
            <u><strong>GFR Reference Values:</strong><br /></u>
            Normal function: &ge; 90<br />
            Mild decrease: 60-89<br />
            Moderate decrease: 30-59<br />
            Severe decrease: 15-29<br />
            Kidney failure: &lt; 15
          </div>
        </div>
      </div>

      {/* Creatinine Records Table */}
      <div className="overflow-x-auto mt-10">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-mintGreendark text-white uppercase text-sm leading-normal">
            <tr>
              <th colSpan="4" className="py-3 px-4 text-center text-xl font-sans">
                CREATININE RECORDS AND GFR CALCULATION:
              </th>
            </tr>
            <tr>
              <th className="py-3 px-4 text-left">Date and Time</th>
              <th className="py-3 px-4 text-left">Creatinine (mg/dL)</th>
              <th className="py-3 px-4 text-left">GFR (ml/min/1.73 m²)</th>
              <th className="py-3 px-4 text-center">Delete</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {sortedData.map((entry) => (
              <tr
                key={entry.id}
                onMouseEnter={() => setHoveredIndex(entry.id)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`border-b border-gray-200 hover:bg-gray-50 transition duration-200 ${hoveredIndex === entry.id ? 'bg-gray-200' : ''}`}
              >
                <td className="py-3 px-4">{formatDateTime(entry.date)}</td>
                <td className={`py-3 px-4 ${entry.creatinineLevel === null || entry.creatinineLevel === 'Not Taken' ? 'text-gray-500' : (entry.creatinineLevel < 0.8 || entry.creatinineLevel > 1.2 ? 'text-red-500' : 'text-green-500')}`}>
                  {entry.creatinineLevel === null || entry.creatinineLevel === 'Not Taken' ? 'Not Taken' : entry.creatinineLevel}
                </td>
                <td className="py-3 px-4">{entry.gfr === null || entry.gfr === 'Not Taken' ? 'Not Taken' : entry.gfr}</td>
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

export default CreatinineChart;
