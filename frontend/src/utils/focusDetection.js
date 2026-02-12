/**
 * Keyboard Focus Detection
 * Detects when user is navigating with keyboard and adds appropriate class to body
 * This allows for better focus styling for keyboard users while keeping clean UI for mouse users
 */

let isKeyboardUser = false;

/**
 * Initialize keyboard focus detection
 */
export const initKeyboardFocusDetection = () => {
  // Detect keyboard usage
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      if (!isKeyboardUser) {
        isKeyboardUser = true;
        document.body.classList.add('user-is-tabbing');
      }
    }
  };

  // Detect mouse usage
  const handleMouseDown = () => {
    if (isKeyboardUser) {
      isKeyboardUser = false;
      document.body.classList.remove('user-is-tabbing');
    }
  };

  // Add event listeners
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('mousedown', handleMouseDown);

  // Cleanup function
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('mousedown', handleMouseDown);
  };
};

/**
 * Check if user is currently using keyboard navigation
 */
export const isUsingKeyboard = () => isKeyboardUser;

/**
 * Force enable keyboard focus mode
 */
export const enableKeyboardFocusMode = () => {
  isKeyboardUser = true;
  document.body.classList.add('user-is-tabbing');
};

/**
 * Force disable keyboard focus mode
 */
export const disableKeyboardFocusMode = () => {
  isKeyboardUser = false;
  document.body.classList.remove('user-is-tabbing');
};
