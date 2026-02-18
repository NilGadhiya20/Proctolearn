import React, { useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
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

const AnimatedAreaChart = ({ 
  title, 
  subtitle,
  data1 = [65, 59, 80, 81, 56, 75, 90],
  data2 = [45, 49, 60, 71, 46, 55, 70],
  labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  label1 = 'Students Active',
  label2 = 'Quizzes Taken',
  height = 350,
  showTrend = true
}) => {
  const chartRef = useRef(null);

  const calculateTrend = (data) => {
    if (data.length < 2) return 0;
    const recent = data.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const previous = data.slice(-6, -3).reduce((a, b) => a + b, 0) / 3;
    return ((recent - previous) / previous * 100).toFixed(1);
  };

  const trend1 = calculateTrend(data1);
  const trend2 = calculateTrend(data2);

  const chartData = {
    labels,
    datasets: [
      {
        label: label1,
        data: data1,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 350);
          gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
          gradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.2)');
          gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: 'rgb(99, 102, 241)',
        pointHoverBorderWidth: 3,
      },
      {
        label: label2,
        data: data2,
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 350);
          gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
          gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.2)');
          gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: 'rgb(16, 185, 129)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: 'rgb(16, 185, 129)',
        pointHoverBorderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart',
    },
    interaction: {
      mode: 'index',
      intersect: false,
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
        borderColor: 'rgba(99, 102, 241, 0.5)',
        borderWidth: 1,
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
        },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="dashboard-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800 mb-1">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>

      {/* Legend with Trends */}
      {showTrend && (
        <div className="flex items-center gap-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
            <div>
              <p className="text-sm font-semibold text-slate-700">{label1}</p>
              <div className="flex items-center gap-1 mt-0.5">
                {trend1 > 0 ? (
                  <TrendingUp size={14} className="text-emerald-500" />
                ) : (
                  <TrendingDown size={14} className="text-red-500" />
                )}
                <span className={`text-xs font-bold ${trend1 > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {Math.abs(trend1)}%
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <div>
              <p className="text-sm font-semibold text-slate-700">{label2}</p>
              <div className="flex items-center gap-1 mt-0.5">
                {trend2 > 0 ? (
                  <TrendingUp size={14} className="text-emerald-500" />
                ) : (
                  <TrendingDown size={14} className="text-red-500" />
                )}
                <span className={`text-xs font-bold ${trend2 > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {Math.abs(trend2)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div style={{ height: `${height}px` }} className="relative">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </motion.div>
  );
};

export default AnimatedAreaChart;
