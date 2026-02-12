# Keyboard Navigation & Accessibility Implementation

## Overview
This document provides a comprehensive overview of the keyboard navigation and accessibility features implemented across the ProctoLearn platform.

## Implementation Summary

### 1. Utilities & Helpers

#### `utils/keyboardNavigation.js`
Core utilities for keyboard navigation including:
- **KEYS Constants**: Centralized keyboard key codes
- **Focus Management**: Functions to manage focus state
  - `getFocusableElements()`: Get all focusable elements in a container
  - `trapFocus()`: Trap focus within modals/dialogs
  - `focusFirstElement()`: Focus first interactive element
  - `restoreFocus()`: Restore focus to previous element
- **Navigation Handlers**: 
  - `handleButtonKeyboard()`: Enter/Space key support for buttons
  - `handleListKeyboard()`: Arrow key navigation for lists
  - `handleTabKeyboard()`: Horizontal tab navigation
  - `handleEscapeKey()`: ESC key handler for closing overlays
  - `handleModalKeyboard()`: Combined modal keyboard support
- **Accessibility Helpers**:
  - `getAccessibleButtonProps()`: Generate ARIA props for clickable elements
  - `announceToScreenReader()`: Make announcements to screen readers
  - `shouldEnableKeyboardNav()`: Check if keyboard nav should be enabled

#### `utils/focusDetection.js`
Detects keyboard vs mouse usage:
- Adds `user-is-tabbing` class to body when Tab is pressed
- Removes class when mouse is used
- Enables better focus indicators for keyboard users only

### 2. Custom Hooks

#### `hooks/useKeyboardNavigation.js`
React hooks for keyboard navigation:

- **`useFocusTrap(isOpen, containerRef)`**: Trap focus in modals
- **`useEscapeKey(isOpen, onClose)`**: Close components with ESC
- **`useArrowNavigation(containerRef, options)`**: Arrow key navigation in lists
- **`useTabNavigation(tabCount, currentTab, onTabChange)`**: Tab list navigation
- **`useDropdownNavigation(isOpen, onClose, itemCount, onSelect)`**: Dropdown keyboard support
- **`useButtonRole(onClick, disabled)`**: Add button accessibility to non-button elements
- **`useRovingTabIndex(containerRef, activeIndex)`**: Roving tabindex pattern
- **`useSkipLink(targetId)`**: Skip link navigation

### 3. Components

#### `components/Common/SkipLink.jsx`
Skip to main content link for keyboard users:
- Hidden by default
- Visible when focused (Tab on page load)
- Allows jumping directly to main content

### 4. Styles

#### `styles/accessibility.css`
Comprehensive accessibility styles:
- **Screen Reader Classes**: `.sr-only`, `.focus:not-sr-only`
- **Focus Indicators**: Enhanced focus-visible styles
- **Skip Link Styles**: Animated skip link on focus
- **Reduced Motion**: Respects `prefers-reduced-motion`
- **High Contrast**: Support for dark mode focus
- **ARIA Role Styles**: Consistent styling for ARIA patterns
- **Keyboard Hints**: Styling for keyboard shortcut hints

### 5. Page Updates

#### Landing Page (`pages/Landing.jsx`)
- Added Skip Link component
- ESC key closes mobile menu
- Focus trap in mobile menu when open
- Main content landmark with `id="main-content"`
- Proper ARIA labels on navigation

#### Login Page (`pages/Login.jsx`)
- Tab navigation between Student/Faculty/Admin tabs
- Arrow keys navigate between tabs
- Roving tabindex on tab buttons
- Proper `role="tablist"` and `role="tab"` attributes
- ARIA attributes: `aria-selected`, `aria-controls`, `aria-labelledby`
- Focus indicators on all interactive elements
- Tab panels with `role="tabpanel"`

#### Quiz Attempt Page (`pages/QuizAttempt.jsx`)
- Left/Right arrow keys navigate between questions
- Number keys (1-4) select answer options
- F key toggles flag for review
- ESC key closes submit dialog
- Focus trap in submit confirmation dialog
- Keyboard shortcuts ignore when typing in input fields

#### Register Page
- Already has good form accessibility
- Tab navigation through fields
- Enter key submits form

### 6. App-Level Integration

#### `App.jsx`
- Imports accessibility styles globally
- Initializes keyboard focus detection on mount
- Cleanup on unmount

## Keyboard Shortcuts Reference

### Global
| Key | Action |
|-----|--------|
| Tab | Move to next interactive element |
| Shift + Tab | Move to previous interactive element |
| Enter | Activate button/link |
| Space | Activate button |
| Escape | Close modal/dialog/dropdown |

### Login Tabs
| Key | Action |
|-----|--------|
| Left/Right Arrow | Navigate between tabs |
| Home | Jump to first tab |
| End | Jump to last tab |

### Quiz Attempt
| Key | Action |
|-----|--------|
| 1-4 | Select answer option |
| Left Arrow | Previous question |
| Right Arrow | Next question |
| F | Toggle flag for review |
| Escape | Close dialog |

### Lists/Dropdowns
| Key | Action |
|-----|--------|
| Up/Down Arrow | Navigate options |
| Home | First option |
| End | Last option |
| Enter | Select option |
| Escape | Close dropdown |

## ARIA Attributes Used

- `role="tablist"` - Tab container
- `role="tab"` - Individual tabs
- `role="tabpanel"` - Tab content panels
- `role="button"` - Clickable elements
- `role="navigation"` - Navigation containers
- `role="dialog"` - Modal dialogs
- `role="status"` - Status messages
- `role="alert"` - Important alerts
- `aria-label` - Accessible labels
- `aria-labelledby` - Label references
- `aria-controls` - Controls relationships
- `aria-selected` - Selected state
- `aria-expanded` - Expanded state
- `aria-hidden` - Hidden from screen readers
- `aria-live` - Live region updates
- `aria-disabled` - Disabled state
- `aria-invalid` - Form validation
- `aria-busy` - Loading state

## Focus Management Patterns

### Focus Trap (Modals/Dialogs)
```javascript
import { useFocusTrap } from '../hooks/useKeyboardNavigation';

const dialogRef = useRef(null);
useFocusTrap(isOpen, dialogRef);
```

### Escape Key Handler
```javascript
import { useEscapeKey } from '../hooks/useKeyboardNavigation';

useEscapeKey(isOpen, onClose);
```

### Tab Navigation
```javascript
import { useTabNavigation } from '../hooks/useKeyboardNavigation';

const { handleKeyDown } = useTabNavigation(
  tabCount,
  currentTab,
  setCurrentTab
);
```

## Testing

### Manual Testing Checklist
- [ ] Unplug mouse and navigate entire app with keyboard
- [ ] All interactive elements are reachable with Tab
- [ ] Focus indicators are clearly visible
- [ ] Modals trap focus properly
- [ ] ESC closes all overlays
- [ ] Skip link works on all pages
- [ ] Tab navigation works in login page
- [ ] Quiz shortcuts work (1-4, arrows, F)
- [ ] No keyboard traps (can always navigate away)
- [ ] Focus returns to trigger after closing modals

### Screen Reader Testing
- [ ] Test with NVDA (Windows)
- [ ] Test with JAWS (Windows)
- [ ] Test with VoiceOver (macOS/iOS)
- [ ] All images have alt text
- [ ] Form fields have labels
- [ ] Buttons have accessible names
- [ ] Status messages are announced
- [ ] Page structure is logical

### Automated Testing
```bash
# Install tools
npm install -D @axe-core/react

# Run accessibility audit
npm run test:a11y
```

## Browser Support

| Browser | Keyboard Nav | Focus Indicators | ARIA Support |
|---------|-------------|------------------|--------------|
| Chrome 90+ | ✅ Full | ✅ Full | ✅ Full |
| Firefox 88+ | ✅ Full | ✅ Full | ✅ Full |
| Safari 14+ | ✅ Full | ⚠️ Requires settings | ✅ Full |
| Edge 90+ | ✅ Full | ✅ Full | ✅ Full |

### Safari Note
Enable "Tab highlights each item on a webpage" in:
Safari > Preferences > Advanced

## Standards Compliance

✅ **WCAG 2.1 Level AA**
- 2.1.1 Keyboard (A)
- 2.1.2 No Keyboard Trap (A)
- 2.4.3 Focus Order (A)
- 2.4.7 Focus Visible (AA)

✅ **ARIA 1.2**
- Tab pattern
- Dialog pattern
- Button pattern
- Navigation pattern

✅ **Section 508**
- Keyboard accessibility
- Focus indicators
- Skip navigation

## Performance Considerations

- Keyboard listeners use event delegation
- Focus detection minimal overhead
- CSS-only focus indicators (no JS)
- Cleanup functions prevent memory leaks

## Future Enhancements

### Planned Features
1. **Keyboard Shortcut Cheat Sheet**: Press `?` to show all shortcuts
2. **Custom Keyboard mapping**: Allow users to customize shortcuts
3. **Keyboard Macro Support**: Record and replay keyboard actions
4. **Advanced Table Navigation**: Full arrow key support in data tables
5. **Voice Commands**: Integration with Web Speech API
6. **Gesture Support**: Touch gesture alternatives for mobile

### Accessibility Roadmap
- [ ] Add more skip links (skip to navigation, skip to footer)
- [ ] Implement keyboard shortcut customization
- [ ] Add visual keyboard shortcut hints to buttons
- [ ] Support for keyboard-only color picker
- [ ] Keyboard control for video player in monitoring
- [ ] Full keyboard support for drag-and-drop interfaces

## Maintenance

### Adding Keyboard Support to New Components

1. **Import necessary utilities/hooks**:
```javascript
import { useEscapeKey } from '../hooks/useKeyboardNavigation';
import { KEYS } from '../utils/keyboardNavigation';
```

2. **Add keyboard event handlers**:
```javascript
const handleKeyDown = (e) => {
  if (e.key === KEYS.ENTER) {
    // Handle enter key
  }
};
```

3. **Add ARIA attributes**:
```jsx
<button
  role="button"
  aria-label="Descriptive label"
  tabIndex={0}
  onKeyDown={handleKeyDown}
>
```

4. **Test with keyboard only**

### Code Review Checklist
- [ ] All buttons have keyboard support
- [ ] Focus traps are properly implemented
- [ ] ARIA attributes are correct
- [ ] Focus indicators are visible
- [ ] No custom tabindex > 0
- [ ] Keyboard shortcuts documented
- [ ] Screen reader tested

## Resources

- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Accessible Components Library](https://a11y-style-guide.com/)
- [Keyboard Navigation Best Practices](https://webaim.org/techniques/keyboard/)

## Support

For questions or issues related to keyboard navigation:
1. Check this documentation
2. Review `KEYBOARD_NAVIGATION.md` user guide
3. Test with keyboard only
4. Check browser console for errors
5. Report issues with detailed steps to reproduce
