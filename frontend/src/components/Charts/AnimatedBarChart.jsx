import React, { useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { MoreVertical, Download } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AnimatedBarChart = ({ 
  title, 
  subtitle,
  data = [12, 19, 15, 25, 22, 30],
  labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  height = 300,
  color = 'indigo',
  showDownload = false,
  onDownload,
  orientation = 'vertical' // 'vertical' or 'horizontal'
}) => {
  const chartRef = useRef(null);

  const colorSchemes = {
    indigo: {
      bg: 'rgba(99, 102, 241, 0.8)',
      border: 'rgb(99, 102, 241)',
      hover: 'rgba(79, 70, 229, 0.9)',
    },
    emerald: {
      bg: 'rgba(16, 185, 129, 0.8)',
      border: 'rgb(16, 185, 129)',
      hover: 'rgba(5, 150, 105, 0.9)',
    },
    orange: {
      bg: 'rgba(251, 146, 60, 0.8)',
      border: 'rgb(251, 146, 60)',
      hover: 'rgba(249, 115, 22, 0.9)',
    },
    purple: {
      bg: 'rgba(168, 85, 247, 0.8)',
      border: 'rgb(168, 85, 247)',
      hover: 'rgba(147, 51, 234, 0.9)',
    },
    blue: {
      bg: 'rgba(59, 130, 246, 0.8)',
      border: 'rgb(59, 130, 246)',
      hover: 'rgba(37, 99, 235, 0.9)',
    },
  };

  const scheme = colorSchemes[color] || colorSchemes.indigo;

  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data,
        backgroundColor: scheme.bg,
        borderColor: scheme.border,
        borderWidth: 0,
        borderRadius: orientation === 'horizontal' ? {
          topRight: 8,
          bottomRight: 8,
        } : {
          topLeft: 8,
          topRight: 8,
        },
        borderSkipped: false,
        hoverBackgroundColor: scheme.hover,
        barThickness: orientation === 'horizontal' ? 24 : 'auto',
      },
    ],
  };

  const options = {
    indexAxis: orientation === 'horizontal' ? 'y' : 'x',
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart',
      delay: (context) => {
        let delay = 0;
        if (context.type === 'data' && context.mode === 'default') {
          delay = context.dataIndex * 100;
        }
        return delay;
      },
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
        displayColors: false,
        borderColor: scheme.border,
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.parsed[orientation === 'horizontal' ? 'x' : 'y']} quizzes`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: orientation === 'vertical',
          color: 'rgba(148, 163, 184, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 11,
            weight: '500',
          },
          padding: 8,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          display: orientation === 'horizontal',
          color: 'rgba(148, 163, 184, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 11,
            weight: '500',
          },
          padding: 8,
        },
      },
    },
  };

  const totalValue = data.reduce((a, b) => a + b, 0);
  const avgValue = Math.round(totalValue / data.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="dashboard-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {showDownload && onDownload && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDownload}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <Download size={18} />
            </motion.button>
          )}
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>
      
      <div style={{ height: `${height}px` }} className="relative">
        <Bar ref={chartRef} data={chartData} options={options} />
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-6 border-t border-slate-200 flex items-center justify-around">
        <div className="text-center">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Total</p>
          <p className="text-xl font-bold text-slate-800">{totalValue}</p>
        </div>
        <div className="w-px h-10 bg-slate-200"></div>
        <div className="text-center">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Average</p>
          <p className="text-xl font-bold text-slate-800">{avgValue}</p>
        </div>
        <div className="w-px h-10 bg-slate-200"></div>
        <div className="text-center">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Peak</p>
          <p className="text-xl font-bold text-slate-800">{Math.max(...data)}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default AnimatedBarChart;
