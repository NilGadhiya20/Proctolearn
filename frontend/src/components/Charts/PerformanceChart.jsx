import React from 'react';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp } from 'lucide-react';
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

const PerformanceChart = ({ 
  title = 'Quiz Performance Over Time',
  subtitle = 'Completion rates and student engagement',
  height = 350,
  period = '30 days'
}) => {
  // Generate time-series data for the last 30 days
  const generateLabels = (days) => {
    const labels = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    return labels;
  };

  const labels = generateLabels(30);
  
  // Mock data - replace with real data
  const completionRates = Array.from({ length: 30 }, () => 
    Math.floor(Math.random() * (95 - 65 + 1) + 65)
  );
  
  const participationRates = Array.from({ length: 30 }, () => 
    Math.floor(Math.random() * (85 - 55 + 1) + 55)
  );
  
  const averageScores = Array.from({ length: 30 }, () => 
    Math.floor(Math.random() * (90 - 70 + 1) + 70)
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Completion Rate',
        data: completionRates,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Participation Rate',
        data: participationRates,
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(16, 185, 129)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Average Score',
        data: averageScores,
        borderColor: 'rgb(251, 146, 60)',
        backgroundColor: 'rgba(251, 146, 60, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(251, 146, 60)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 2500,
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
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}%`;
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
            size: 10,
            weight: '500',
          },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
        },
      },
      y: {
        min: 0,
        max: 100,
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
          callback: function(value) {
            return value + '%';
          },
        },
      },
    },
  };

  const avgCompletion = (completionRates.reduce((a, b) => a + b, 0) / completionRates.length).toFixed(1);
  const avgParticipation = (participationRates.reduce((a, b) => a + b, 0) / participationRates.length).toFixed(1);
  const avgScore = (averageScores.reduce((a, b) => a + b, 0) / averageScores.length).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="dashboard-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 lg:col-span-2"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
          <Calendar size={14} />
          <span>Last {period}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
          <span className="text-sm font-semibold text-slate-700">Completion Rate</span>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
            {avgCompletion}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="text-sm font-semibold text-slate-700">Participation</span>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
            {avgParticipation}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span className="text-sm font-semibold text-slate-700">Avg Score</span>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
            {avgScore}%
          </span>
        </div>
      </div>
      
      <div style={{ height: `${height}px` }} className="relative">
        <Line data={chartData} options={options} />
      </div>

      {/* Performance Summary */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-emerald-500" size={18} />
            <span className="font-semibold text-slate-700">Overall Trend:</span>
          </div>
          <span className="text-emerald-600 font-bold">+8.5% improvement</span>
        </div>
      </div>
    </motion.div>
  );
};

export default PerformanceChart;
