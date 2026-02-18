# Animated Charts Documentation

## Overview
This guide documents the animated chart components created for the Proctolearn dashboard. All charts use Chart.js with Framer Motion animations and follow the established design system with gradient colors and professional styling.

---

## Components Created

### 1. **AnimatedLineChart**
- **Location:** `frontend/src/components/Charts/AnimatedLineChart.jsx`
- **Purpose:** Display time-series data with line graphs
- **Key Features:**
  - Single or multiple datasets support
  - Gradient area fills
  - Staggered point animations (100ms delay per point)
  - Stats footer showing total/average/peak values
  - Customizable timeframe badge
  - Responsive height

**Usage Example:**
```jsx
import { AnimatedLineChart } from '../components';

<AnimatedLineChart
  title="Student Engagement"
  subtitle="Daily active users over time"
  labels={['Jan', 'Feb', 'Mar', 'Apr', 'May']}
  datasets={[
    {
      label: 'Active Students',
      data: [120, 150, 180, 160, 200],
      borderColor: 'rgb(99, 102, 241)',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
    }
  ]}
  height={350}
  timeframe="6 months"
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | 'Line Chart' | Chart title |
| `subtitle` | string | null | Optional subtitle |
| `labels` | array | required | X-axis labels |
| `datasets` | array | required | Chart.js datasets array |
| `height` | number | 350 | Chart height in pixels |
| `timeframe` | string | '7 days' | Display period badge |

---

### 2. **AnimatedAreaChart**
- **Location:** `frontend/src/components/Charts/AnimatedAreaChart.jsx`
- **Purpose:** Compare two datasets with gradient-filled area charts
- **Key Features:**
  - Dual-line comparison
  - Automatic trend calculation (3-period moving average)
  - TrendingUp/Down icons
  - Interactive tooltips
  - 2000ms smooth animations

**Usage Example:**
```jsx
import { AnimatedAreaChart } from '../components';

<AnimatedAreaChart
  title="Engagement Comparison"
  subtitle="Students vs quizzes over time"
  labels={['Week 1', 'Week 2', 'Week 3', 'Week 4']}
  dataset1={{
    label: 'Students Active',
    data: [120, 145, 160, 180],
    borderColor: 'rgb(99, 102, 241)',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  }}
  dataset2={{
    label: 'Quizzes Taken',
    data: [45, 52, 61, 70],
    borderColor: 'rgb(16, 185, 129)',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  }}
  height={350}
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | 'Area Chart' | Chart title |
| `subtitle` | string | null | Optional subtitle |
| `labels` | array | required | X-axis labels |
| `dataset1` | object | required | First dataset config |
| `dataset2` | object | required | Second dataset config |
| `height` | number | 350 | Chart height in pixels |

---

### 3. **AnimatedBarChart**
- **Location:** `frontend/src/components/Charts/AnimatedBarChart.jsx`
- **Purpose:** Display categorical data with vertical/horizontal bars
- **Key Features:**
  - 5 color schemes (indigo, emerald, orange, purple, blue)
  - Vertical & horizontal orientation support
  - Staggered entry animations (100ms delay per bar)
  - Rounded bar corners
  - Download/export button
  - Stats footer with total/average/peak

**Usage Example:**
```jsx
import { AnimatedBarChart } from '../components';

<AnimatedBarChart
  title="Quiz Categories"
  subtitle="Distribution by subject"
  labels={['Math', 'Science', 'History', 'Programming', 'Physics']}
  data={[12, 19, 8, 15, 10]}
  colorScheme="indigo"
  orientation="vertical"
  height={350}
  downloadable={true}
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | 'Bar Chart' | Chart title |
| `subtitle` | string | null | Optional subtitle |
| `labels` | array | required | Category labels |
| `data` | array | required | Bar values |
| `colorScheme` | string | 'indigo' | Color theme (indigo/emerald/orange/purple/blue) |
| `orientation` | string | 'vertical' | Bar direction (vertical/horizontal) |
| `height` | number | 350 | Chart height in pixels |
| `downloadable` | boolean | false | Show download button |

**Color Schemes:**
- `indigo`: Primary blue-purple gradient
- `emerald`: Green success colors
- `orange`: Warm accent colors
- `purple`: Rich purple tones
- `blue`: Sky blue shades

---

### 4. **AnimatedDoughnutChart**
- **Location:** `frontend/src/components/Charts/AnimatedDoughnutChart.jsx`
- **Purpose:** Display proportional data in circular format
- **Key Features:**
  - Customizable cutout percentage (doughnut vs pie)
  - Center text showing total value
  - Animated legend with percentage badges
  - 8px hover offset effects
  - 2000ms rotation animation
  - Color-coded segments

**Usage Example:**
```jsx
import { AnimatedDoughnutChart } from '../components';

<AnimatedDoughnutChart
  title="Quiz Status Distribution"
  subtitle="Current quiz lifecycle stages"
  labels={['Active', 'Closed', 'Draft']}
  data={[15, 8, 3]}
  colors={[
    'rgba(34, 197, 94, 0.8)',
    'rgba(239, 68, 68, 0.8)',
    'rgba(156, 163, 175, 0.8)'
  ]}
  cutout="70%"
  centerText="Total Quizzes"
  height={350}
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | 'Doughnut Chart' | Chart title |
| `subtitle` | string | null | Optional subtitle |
| `labels` | array | required | Segment labels |
| `data` | array | required | Segment values |
| `colors` | array | auto | Custom segment colors |
| `cutout` | string | '70%' | Center hole size ('0%' for pie) |
| `centerText` | string | null | Text in center ring |
| `height` | number | 350 | Chart height in pixels |

---

### 5. **PerformanceChart**
- **Location:** `frontend/src/components/Charts/PerformanceChart.jsx`
- **Purpose:** Multi-metric performance tracking over time
- **Key Features:**
  - Pre-configured for 3 metrics:
    - Completion Rate (indigo)
    - Participation Rate (emerald)
    - Average Score (orange)
  - 30-day time-series data
  - Automatic averaging in legend
  - Overall trend indicator
  - Custom legend with badges

**Usage Example:**
```jsx
import { PerformanceChart } from '../components';

<PerformanceChart 
  title="Quiz Performance Over Time"
  subtitle="Completion rates, participation, and average scores"
  height={350}
  period="30 days"
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | 'Quiz Performance Over Time' | Chart title |
| `subtitle` | string | see above | Optional subtitle |
| `height` | number | 350 | Chart height in pixels |
| `period` | string | '30 days' | Display period |

**Note:** Currently uses mock data. Replace the data generation logic with real API calls.

---

## Integration in AdminDashboard

The charts have been integrated into `AdminDashboard.jsx`:

```jsx
// Import
import { 
  AnimatedLineChart, 
  AnimatedAreaChart, 
  AnimatedBarChart, 
  AnimatedDoughnutChart,
  PerformanceChart 
} from '../components';

// Usage in render
<PerformanceChart 
  title="Quiz Performance Over Time"
  subtitle="Completion rates, participation, and average scores"
  height={350}
  period="30 days"
/>

<AnimatedBarChart
  title="Quiz Categories"
  subtitle="Distribution by subject"
  labels={['Math', 'Science', 'History', 'Programming', 'Physics', 'General']}
  data={[12, 19, 3, 5, 2, 3]}
  colorScheme="indigo"
  height={350}
/>

<AnimatedDoughnutChart
  title="Quiz Status Distribution"
  subtitle="Current quiz lifecycle stages"
  labels={['Active', 'Closed', 'Draft']}
  data={[stats.activeQuizzes, stats.completedQuizzes, stats.totalQuizzes - (stats.activeQuizzes + stats.completedQuizzes)]}
  colors={['rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)', 'rgba(156, 163, 175, 0.8)']}
  height={350}
/>
```

---

## Design System Integration

### Colors
All charts use the established gradient color palette:
- **Indigo**: `rgb(99, 102, 241)` → Primary
- **Purple**: `rgb(168, 85, 247)` → Secondary
- **Emerald**: `rgb(16, 185, 129)` → Success
- **Orange**: `rgb(251, 146, 60)` → Warning
- **Red**: `rgb(239, 68, 68)` → Danger
- **Blue**: `rgb(59, 130, 246)` → Info
- **Slate**: `rgb(148, 163, 184)` → Neutral

### Animations
- **Duration:** 2000-2500ms for full animations
- **Easing:** `easeInOutQuart` for smooth transitions
- **Stagger:** 100ms delay between sequential elements
- **Container:** Framer Motion with opacity/y transforms

### Tooltips
All charts use consistent dark-themed tooltips:
```js
tooltip: {
  backgroundColor: 'rgba(15, 23, 42, 0.95)',
  titleColor: '#fff',
  bodyColor: '#fff',
  padding: 12,
  cornerRadius: 8,
  borderWidth: 1,
  borderColor: 'rgba(99, 102, 241, 0.5)',
}
```

### Card Styling
Charts are wrapped in dashboard cards:
```css
.dashboard-card {
  @apply bg-white rounded-2xl border border-slate-200 
         p-6 shadow-sm hover:shadow-md 
         transition-all duration-300;
}
```

---

## Responsive Behavior

All charts are fully responsive:
- **Mobile (< 768px):** Full width, reduced padding, smaller fonts
- **Tablet (768px - 1024px):** 2-column grid for paired charts
- **Desktop (> 1024px):** Multi-column layouts, full feature set

### Grid Classes Used:
```jsx
// Full width
<div className="lg:col-span-2">

// Half width on desktop
<div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
```

---

## Performance Considerations

### Optimization Tips:
1. **Lazy Loading:** Import charts only when needed
2. **Memoization:** Use `React.memo()` for chart components if data doesn't change frequently
3. **Data Throttling:** Limit time-series data points to < 50 for smooth animations
4. **Animation Duration:** Keep under 3000ms for perceived performance
5. **Point Rendering:** Disable point rendering (`pointRadius: 0`) for datasets with > 30 points

### Example Optimization:
```jsx
const MemoizedChart = React.memo(AnimatedLineChart);

// Use with stable data
<MemoizedChart {...chartProps} />
```

---

## Accessibility

All charts include:
- Semantic HTML structure
- ARIA labels where applicable
- Keyboard navigation support (via Chart.js)
- High contrast tooltips
- Screen reader friendly legends

### ARIA Example:
```jsx
<div role="img" aria-label="Bar chart showing quiz categories">
  <AnimatedBarChart {...props} />
</div>
```

---

## Browser Support

Charts work in all modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Dependencies:**
- Chart.js 4.x
- react-chartjs-2 5.x
- Framer Motion 10.x
- Lucide React 0.x

---

## Customization Guide

### Adding New Chart Type

1. Create new component in `frontend/src/components/Charts/`
2. Register required Chart.js elements
3. Add Framer Motion container wrapper
4. Include consistent tooltip styling
5. Export from `components/index.js`

**Template:**
```jsx
import React from 'react';
import { ChartType } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { ChartJS, ...Elements } from 'chart.js';

ChartJS.register(...Elements);

const CustomChart = ({ title, data, height = 350 }) => {
  const chartOptions = {
    // Chart.js options
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="dashboard-card"
    >
      <h3>{title}</h3>
      <div style={{ height: `${height}px` }}>
        <ChartType data={data} options={chartOptions} />
      </div>
    </motion.div>
  );
};

export default CustomChart;
```

### Changing Color Schemes

Modify color constants at the top of each chart component:
```jsx
const colorPalette = {
  indigo: {
    border: 'rgb(99, 102, 241)',
    background: 'rgba(99, 102, 241, 0.1)',
  },
  // Add custom colors
};
```

### Adjusting Animations

Edit animation configs in Chart.js options:
```jsx
animation: {
  duration: 2000, // Change duration
  easing: 'easeInOutQuart', // Change easing
  delay: (context) => context.dataIndex * 100, // Stagger effect
}
```

---

## Troubleshooting

### Charts Not Rendering
```bash
# Ensure dependencies are installed
npm install chart.js react-chartjs-2

# Clear cache and restart
npm run dev -- --force
```

### Animation Issues
- Reduce `duration` if animations feel sluggish
- Check browser performance settings
- Disable animations on lower-end devices

### Data Not Updating
- Ensure parent component re-renders
- Use unique keys for chart components
- Call `chart.update()` if manipulating Chart.js directly

### TypeScript Errors
```typescript
// Install type definitions
npm install --save-dev @types/chart.js
```

---

## Future Enhancements

Potential improvements:
1. **Real-time Updates:** Socket.io integration for live data
2. **Export Options:** PDF/PNG export functionality
3. **Drill-down:** Click charts to see detailed views
4. **Comparison Mode:** Side-by-side time period comparison
5. **Custom Annotations:** Add markers for important events
6. **Dark Mode:** Theme-aware color schemes
7. **Print Optimization:** Print-friendly styling

---

## Related Documentation

- [DASHBOARD_ENHANCEMENTS.md](./DASHBOARD_ENHANCEMENTS.md) - Overall dashboard upgrade guide
- [KEYBOARD_NAVIGATION.md](./KEYBOARD_NAVIGATION.md) - Accessibility features
- [RESPONSIVE_DESIGN.md](./RESPONSIVE_DESIGN.md) - Mobile optimization

---

## Support

For issues or questions:
1. Check Chart.js documentation: https://www.chartjs.org/docs/
2. Review Framer Motion docs: https://www.framer.com/motion/
3. Inspect browser console for errors
4. Verify data structure matches expected format

---

**Last Updated:** December 2024  
**Author:** GitHub Copilot  
**Version:** 1.0.0
