# Mobile-Friendly Sidebar Navigation

This enhanced mobile sidebar system provides smooth animations, touch gestures, and responsive behavior for dashboard layouts.

## Components

### 1. HamburgerMenu
A customizable hamburger menu button with animations and multiple variants.

```jsx
import HamburgerMenu from '../components/Layout/HamburgerMenu';

<HamburgerMenu
  isOpen={sidebarOpen}
  onToggle={() => setSidebarOpen(!sidebarOpen)}
  variant="outline" // 'default', 'primary', 'ghost', 'outline'
  size="md" // 'sm', 'md', 'lg'
  showLabel={true}
/>
```

### 2. Enhanced DashboardSidebar
The enhanced sidebar with mobile-friendly features:

- **Swipe gestures** - Drag to close on mobile
- **Smooth animations** - Spring-based transitions
- **Touch-friendly targets** - Optimized for mobile tapping
- **Keyboard navigation** - ESC key support
- **Auto-scroll prevention** - Prevents body scroll when open

```jsx
import DashboardSidebar from '../components/Layout/DashboardSidebar';

<DashboardSidebar 
  open={sidebarOpen} 
  onClose={() => setSidebarOpen(false)}
  activeItem={activeTab}
  onNavigate={(item) => setActiveTab(item.id)}
  customItems={menuItems}
/>
```

### 3. DashboardLayout
A complete layout wrapper that combines hamburger menu and sidebar:

```jsx
import DashboardLayout from '../components/Layout/DashboardLayout';

<DashboardLayout
  sidebarItems={menuItems}
  activeItem={activeTab}
  onNavigate={handleNavigation}
  hamburgerPlacement="top-left"
>
  {/* Your page content */}
</DashboardLayout>
```

### 4. MobileSidebar
Advanced mobile sidebar with enhanced touch gestures:

```jsx
import MobileSidebar from '../components/Layout/MobileSidebar';

<MobileSidebar
  isOpen={isOpen}
  onClose={onClose}
  enableSwipeGestures={true}
  swipeThreshold={100}
  backdropBlur={true}
  position="left"
>
  {/* Sidebar content */}
</MobileSidebar>
```

## Features

### 🎯 Mobile-First Design
- Touch-optimized interaction areas (min 44px tap targets)
- Smooth momentum scrolling
- Safe area support for devices with notches

### ✨ Smooth Animations
- Spring-based transitions using Framer Motion
- Staggered item animations
- Ripple effects for touch feedback

### 👆 Touch Gestures
- Swipe to close functionality
- Drag handle indicator
- Momentum-based closing

### ⌨️ Keyboard Accessible
- ESC key to close
- Focus management
- ARIA labels and roles

### 🎨 Customizable
- Multiple variants and sizes
- Flexible positioning
- Custom styling support

## Usage Examples

### Basic Implementation
```jsx
import React, { useState } from 'react';
import DashboardSidebar from '../components/Layout/DashboardSidebar';
import HamburgerMenu from '../components/Layout/HamburgerMenu';

const MyDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
    { icon: Users, label: 'Users', id: 'users' },
    { icon: Settings, label: 'Settings', id: 'settings' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        customItems={menuItems}
      />
      
      <main className="flex-1 p-4">
        <div className="lg:hidden mb-4">
          <HamburgerMenu
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>
        
        {/* Your content */}
      </main>
    </div>
  );
};
```

### Advanced Implementation with Layout Wrapper
```jsx
import DashboardLayout from '../components/Layout/DashboardLayout';

const AdvancedDashboard = () => {
  const [activeItem, setActiveItem] = useState('dashboard');

  return (
    <DashboardLayout
      sidebarItems={menuItems}
      activeItem={activeItem}
      onNavigate={(item) => setActiveItem(item.id)}
    >
      <div className="space-y-6">
        {/* Your dashboard content */}
      </div>
    </DashboardLayout>
  );
};
```

## Styling

Import the mobile sidebar CSS utilities:
```jsx
import '../styles/mobile-sidebar.css';
```

This includes:
- Custom scrollbar styles
- Touch interaction utilities
- Safe area support
- Backdrop blur fallbacks

## Browser Support

- **iOS Safari 12+**
- **Chrome Mobile 70+**
- **Firefox Mobile 68+**
- **Samsung Internet 10+**

## Performance Optimizations

1. **Lazy Loading**: Components render only when needed
2. **Hardware Acceleration**: Uses CSS transforms for smooth animations
3. **Memory Management**: Proper cleanup of event listeners
4. **Gesture Recognition**: Efficient touch event handling
5. **Reduced Motion**: Respects user's motion preferences