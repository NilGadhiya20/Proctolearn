import React from 'react';
import { useSkipLink } from '../hooks/useKeyboardNavigation';

/**
 * Skip Link Component for Keyboard Navigation
 * Allows keyboard users to skip navigation and jump to main content
 */
const SkipLink = ({ targetId = 'main-content', children = 'Skip to main content' }) => {
  const { handleClick } = useSkipLink(targetId);

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-green-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      style={{
        position: 'absolute',
        left: '-9999px',
        zIndex: 9999,
      }}
    >
      {children}
    </a>
  );
};

export default SkipLink;
