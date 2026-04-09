/**
 * Keyboard Navigation Utilities for Accessibility
 * Provides comprehensive keyboard support across all interactive components
 */

// Common keyboard key codes
export const KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
};

/**
 * Check if an element is focusable
 */
export const isFocusable = (element) => {
  if (!element) return false;
  
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    'audio[controls]',
    'video[controls]',
  ];
  
  return focusableSelectors.some(selector => element.matches(selector));
};

/**
 * Get all focusable elements within a container
 */
export const getFocusableElements = (container) => {
  if (!container) return [];
  
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    'audio[controls]',
    'video[controls]',
  ].join(',');
  
  return Array.from(container.querySelectorAll(focusableSelectors));
};

/**
 * Trap focus within a container (useful for modals/dialogs)
 */
export const trapFocus = (container, event) => {
  const focusableElements = getFocusableElements(container);
  if (focusableElements.length === 0) return;
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  if (event.key === KEYS.TAB) {
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }
};

/**
 * Handle keyboard navigation for a button
 */
export const handleButtonKeyboard = (event, onClick) => {
  if (event.key === KEYS.ENTER || event.key === KEYS.SPACE) {
    event.preventDefault();
    onClick(event);
  }
};

/**
 * Handle keyboard navigation for lists (arrow keys)
 */
export const handleListKeyboard = (event, currentIndex, itemCount, onNavigate) => {
  let newIndex = currentIndex;
  
  switch (event.key) {
  case KEYS.ARROW_DOWN:
    event.preventDefault();
    newIndex = Math.min(currentIndex + 1, itemCount - 1);
    break;
  case KEYS.ARROW_UP:
    event.preventDefault();
    newIndex = Math.max(currentIndex - 1, 0);
    break;
  case KEYS.HOME:
    event.preventDefault();
    newIndex = 0;
    break;
  case KEYS.END:
    event.preventDefault();
    newIndex = itemCount - 1;
    break;
  default:
    return;
  }
  
  if (newIndex !== currentIndex) {
    onNavigate(newIndex);
  }
};

/**
 * Handle keyboard navigation for horizontal lists/tabs
 */
export const handleTabKeyboard = (event, currentIndex, tabCount, onNavigate) => {
  let newIndex = currentIndex;
  
  switch (event.key) {
  case KEYS.ARROW_LEFT:
    event.preventDefault();
    newIndex = currentIndex > 0 ? currentIndex - 1 : tabCount - 1;
    break;
  case KEYS.ARROW_RIGHT:
    event.preventDefault();
    newIndex = currentIndex < tabCount - 1 ? currentIndex + 1 : 0;
    break;
  case KEYS.HOME:
    event.preventDefault();
    newIndex = 0;
    break;
  case KEYS.END:
    event.preventDefault();
    newIndex = tabCount - 1;
    break;
  default:
    return;
  }
  
  if (newIndex !== currentIndex) {
    onNavigate(newIndex);
  }
};

/**
 * Handle Escape key to close modals/dropdowns
 */
export const handleEscapeKey = (event, onClose) => {
  if (event.key === KEYS.ESCAPE) {
    event.preventDefault();
    onClose();
  }
};

/**
 * Focus the first focusable element in a container
 */
export const focusFirstElement = (container, delay = 0) => {
  setTimeout(() => {
    const focusableElements = getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }, delay);
};

/**
 * Restore focus to a previous element
 */
export const restoreFocus = (element) => {
  if (element && typeof element.focus === 'function') {
    element.focus();
  }
};

/**
 * Add keyboard event listener with cleanup
 */
export const addKeyboardListener = (element, eventType, handler) => {
  if (!element) return () => {};
  
  element.addEventListener(eventType, handler);
  return () => element.removeEventListener(eventType, handler);
};

/**
 * Handle modal keyboard events (Escape to close, Tab trap)
 */
export const handleModalKeyboard = (event, container, onClose) => {
  if (event.key === KEYS.ESCAPE) {
    event.preventDefault();
    onClose();
  } else if (event.key === KEYS.TAB) {
    trapFocus(container, event);
  }
};

/**
 * Create accessible button props
 */
export const getAccessibleButtonProps = (onClick, ariaLabel) => ({
  role: 'button',
  tabIndex: 0,
  'aria-label': ariaLabel,
  onClick,
  onKeyDown: (e) => handleButtonKeyboard(e, onClick),
});

/**
 * Announce to screen readers
 */
export const announceToScreenReader = (message, priority = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Check if keyboard navigation should be enabled (not on mobile)
 */
export const shouldEnableKeyboardNav = () => {
  return !('ontouchstart' in window || navigator.maxTouchPoints > 0);
};
