import React, { useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AnimatedLineChart = ({ 
  title, 
  data, 
  labels, 
  datasets,
  height = 300, 
  subtitle,
  showLegend = true,
  gradient = true,
  animated = true,
  timeframe = 'Last 7 days'
}) => {
  const chartRef = useRef(null);

  const defaultDatasets = datasets || [{
    label: 'Quizzes Created',
    data: data || [12, 19, 15, 25, 22, 30, 28],
    borderColor: 'rgb(99, 102, 241)',
    backgroundColor: gradient ? (context) => {
      const ctx = context.chart.ctx;
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
      gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
      return gradient;
    } : 'rgba(99, 102, 241, 0.1)',
    fill: true,
    tension: 0.4,
    borderWidth: 3,
    pointRadius: 6,
    pointHoverRadius: 8,
    pointBackgroundColor: 'rgb(99, 102, 241)',
    pointBorderColor: '#fff',
    pointBorderWidth: 2,
    pointHoverBackgroundColor: 'rgb(99, 102, 241)',
    pointHoverBorderColor: '#fff',
    pointHoverBorderWidth: 3,
  }];

  const defaultLabels = labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const chartData = {
    labels: defaultLabels,
    datasets: defaultDatasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: animated ? {
      duration: 2000,
      easing: 'easeInOutQuart',
      delay: (context) => {
        let delay = 0;
        if (context.type === 'data' && context.mode === 'default') {
          delay = context.dataIndex * 100;
        }
        return delay;
      },
    } : false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: showLegend,
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '600',
          },
          color: '#64748b',
        },
      },
      tooltip: {
        enabled: true,
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
        borderColor: 'rgba(99, 102, 241, 0.5)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += context.parsed.y;
            return label;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
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
          stepSize: 5,
        },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="dashboard-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
          {timeframe}
        </span>
      </div>
      
      <div style={{ height: `${height}px` }} className="relative">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
      
      {/* Stats Summary */}
      <div className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Total</p>
          <p className="text-lg font-bold text-slate-800">
            {data ? data.reduce((a, b) => a + b, 0) : 0}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Average</p>
          <p className="text-lg font-bold text-slate-800">
            {data ? Math.round(data.reduce((a, b) => a + b, 0) / data.length) : 0}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Peak</p>
          <p className="text-lg font-bold text-slate-800">
            {data ? Math.max(...data) : 0}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default AnimatedLineChart;
