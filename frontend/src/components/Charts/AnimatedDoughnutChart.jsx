import React, { useRef } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const AnimatedDoughnutChart = ({ 
  title, 
  subtitle,
  data = [300, 150, 100],
  labels = ['Active', 'Completed', 'Draft'],
  colors = [
    'rgba(16, 185, 129, 0.9)',
    'rgba(59, 130, 246, 0.9)',
    'rgba(148, 163, 184, 0.9)',
  ],
  height = 300,
  cutout = '75%',
  showPercentage = true
}) => {
  const chartRef = useRef(null);

  const total = data.reduce((a, b) => a + b, 0);

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors,
        borderWidth: 0,
        hoverOffset: 8,
        hoverBorderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout,
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 2000,
      easing: 'easeInOutQuart',
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#fff',
        bodyColor: '#fff',
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.3)',
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="dashboard-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      
      <div style={{ height: `${height}px` }} className="relative flex items-center justify-center">
        <Doughnut ref={chartRef} data={chartData} options={options} />
        
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-4xl font-extrabold text-slate-800">{total}</p>
          <p className="text-sm font-semibold text-slate-500">Total Quizzes</p>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 space-y-3">
        {labels.map((label, index) => {
          const value = data[index];
          const percentage = ((value / total) * 100).toFixed(1);
          
          return (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full shadow-sm"
                  style={{ backgroundColor: colors[index] }}
                />
                <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                  {label}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-800">{value}</span>
                {showPercentage && (
                  <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded-full">
                    {percentage}%
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default AnimatedDoughnutChart;
