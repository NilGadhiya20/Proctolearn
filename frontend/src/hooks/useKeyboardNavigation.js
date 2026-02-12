import { useEffect, useRef, useCallback } from 'react';
import {
  KEYS,
  trapFocus,
  handleEscapeKey,
  getFocusableElements,
  focusFirstElement,
  restoreFocus,
} from '../utils/keyboardNavigation';

/**
 * Hook for managing focus trap in modals/dialogs
 */
export const useFocusTrap = (isOpen, containerRef) => {
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    // Store the currently focused element
    previousFocusRef.current = document.activeElement;

    // Focus the first focusable element in the container
    focusFirstElement(containerRef.current, 100);

    const handleKeyDown = (e) => {
      if (e.key === KEYS.TAB) {
        trapFocus(containerRef.current, e);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus when modal closes
      if (previousFocusRef.current) {
        restoreFocus(previousFocusRef.current);
      }
    };
  }, [isOpen, containerRef]);
};

/**
 * Hook for handling Escape key to close components
 */
export const useEscapeKey = (isOpen, onClose) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      handleEscapeKey(e, onClose);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
};

/**
 * Hook for arrow key navigation in lists
 */
export const useArrowNavigation = (containerRef, options = {}) => {
  const {
    onNavigate,
    currentIndex = 0,
    horizontal = false,
    loop = true,
  } = options;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (e) => {
      const focusableElements = getFocusableElements(container);
      if (focusableElements.length === 0) return;

      const upKey = horizontal ? KEYS.ARROW_LEFT : KEYS.ARROW_UP;
      const downKey = horizontal ? KEYS.ARROW_RIGHT : KEYS.ARROW_DOWN;

      let newIndex = currentIndex;

      if (e.key === upKey) {
        e.preventDefault();
        newIndex = currentIndex > 0 
          ? currentIndex - 1 
          : (loop ? focusableElements.length - 1 : 0);
      } else if (e.key === downKey) {
        e.preventDefault();
        newIndex = currentIndex < focusableElements.length - 1 
          ? currentIndex + 1 
          : (loop ? 0 : focusableElements.length - 1);
      } else if (e.key === KEYS.HOME) {
        e.preventDefault();
        newIndex = 0;
      } else if (e.key === KEYS.END) {
        e.preventDefault();
        newIndex = focusableElements.length - 1;
      } else {
        return;
      }

      if (newIndex !== currentIndex) {
        focusableElements[newIndex]?.focus();
        onNavigate?.(newIndex);
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [containerRef, currentIndex, horizontal, loop, onNavigate]);
};

/**
 * Hook for managing tab navigation with role="tablist"
 */
export const useTabNavigation = (tabCount, currentTab, onTabChange) => {
  const handleKeyDown = useCallback((e) => {
    let newTab = currentTab;

    switch (e.key) {
      case KEYS.ARROW_LEFT:
        e.preventDefault();
        newTab = currentTab > 0 ? currentTab - 1 : tabCount - 1;
        break;
      case KEYS.ARROW_RIGHT:
        e.preventDefault();
        newTab = currentTab < tabCount - 1 ? currentTab + 1 : 0;
        break;
      case KEYS.HOME:
        e.preventDefault();
        newTab = 0;
        break;
      case KEYS.END:
        e.preventDefault();
        newTab = tabCount - 1;
        break;
      default:
        return;
    }

    if (newTab !== currentTab) {
      onTabChange(newTab);
    }
  }, [currentTab, tabCount, onTabChange]);

  return { handleKeyDown };
};

/**
 * Hook for dropdown keyboard navigation
 */
export const useDropdownNavigation = (isOpen, onClose, itemCount, onSelect) => {
  const selectedIndexRef = useRef(0);

  useEffect(() => {
    if (!isOpen) {
      selectedIndexRef.current = 0;
      return;
    }

    const handleKeyDown = (e) => {
      switch (e.key) {
        case KEYS.ESCAPE:
          e.preventDefault();
          onClose();
          break;
        case KEYS.ARROW_DOWN:
          e.preventDefault();
          selectedIndexRef.current = Math.min(selectedIndexRef.current + 1, itemCount - 1);
          break;
        case KEYS.ARROW_UP:
          e.preventDefault();
          selectedIndexRef.current = Math.max(selectedIndexRef.current - 1, 0);
          break;
        case KEYS.HOME:
          e.preventDefault();
          selectedIndexRef.current = 0;
          break;
        case KEYS.END:
          e.preventDefault();
          selectedIndexRef.current = itemCount - 1;
          break;
        case KEYS.ENTER:
        case KEYS.SPACE:
          e.preventDefault();
          onSelect(selectedIndexRef.current);
          onClose();
          break;
        default:
          return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, itemCount, onSelect]);

  return selectedIndexRef.current;
};

/**
 * Hook for accessible button behavior on non-button elements
 */
export const useButtonRole = (onClick, disabled = false) => {
  const handleKeyDown = useCallback((e) => {
    if (disabled) return;
    
    if (e.key === KEYS.ENTER || e.key === KEYS.SPACE) {
      e.preventDefault();
      onClick(e);
    }
  }, [onClick, disabled]);

  return {
    role: 'button',
    tabIndex: disabled ? -1 : 0,
    onKeyDown: handleKeyDown,
    'aria-disabled': disabled,
  };
};

/**
 * Hook for managing roving tabindex in a group of elements
 */
export const useRovingTabIndex = (containerRef, activeIndex) => {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const focusableElements = getFocusableElements(container);
    
    focusableElements.forEach((element, index) => {
      if (index === activeIndex) {
        element.setAttribute('tabindex', '0');
      } else {
        element.setAttribute('tabindex', '-1');
      }
    });
  }, [containerRef, activeIndex]);
};

/**
 * Hook for skip links navigation
 */
export const useSkipLink = (targetId) => {
  const handleClick = useCallback((e) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [targetId]);

  return { handleClick };
};
