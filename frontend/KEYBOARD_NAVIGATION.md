# Keyboard Navigation Guide

## Overview
ProctoLearn now supports comprehensive keyboard navigation for enhanced accessibility. All interactive components can be accessed and operated using keyboard shortcuts.

## Global Keyboard Shortcuts

### Navigation
- **Tab**: Move focus to next interactive element
- **Shift + Tab**: Move focus to previous interactive element
- **Enter/Space**: Activate buttons and links
- **Escape**: Close modals, dialogs, and dropdowns

### Skip Links
- **Tab (on page load)**: Reveal "Skip to main content" link
- **Enter**: Jump directly to main content area

## Page-Specific Shortcuts

### Login/Register Pages
- **Left/Right Arrow**: Navigate between Student, Faculty, and Admin tabs
- **Home**: Jump to first tab
- **End**: Jump to last tab
- **Enter**: Submit form

### Landing Page
- **Escape**: Close mobile menu (when open)
- **Tab**: Navigate through menu items

### Quiz Attempt Page
- **1-4 (Number keys)**: Select answer options (A, B, C, D)
- **Left Arrow**: Go to previous question
- **Right Arrow**: Go to next question
- **F**: Toggle flag for review on current question
- **Escape**: Close submit confirmation dialog

### Quiz Navigation
- **Up/Down Arrow**: Navigate through question list
- **Home**: Jump to first question
- **End**: Jump to last question
- **Enter**: Select and navigate to question

### Form Fields
- **Tab**: Move between form fields
- **Enter**: Submit form
- **Escape**: Clear focused field (where applicable)

### Dialogs and Modals
- **Tab**: Cycle through interactive elements within dialog
- **Escape**: Close dialog
- **Enter**: Confirm action (on focused button)

### Dropdown Menus
- **Space/Enter**: Open dropdown
- **Up/Down Arrow**: Navigate dropdown options
- **Home**: Jump to first option
- **End**: Jump to last option
- **Enter/Space**: Select highlighted option
- **Escape**: Close dropdown without selection

### Tables
- **Tab**: Navigate through table cells
- **Arrow Keys**: Navigate between cells (where supported)

## Accessibility Features

### Focus Management
- **Visible Focus Indicators**: Blue outline (2px) appears around focused elements
- **Focus Trap**: Focus stays within modals/dialogs when open
- **Focus Restoration**: Focus returns to trigger element when closing modals

### Screen Reader Support
- **ARIA Labels**: All interactive elements have descriptive labels
- **ARIA Live Regions**: Dynamic content changes are announced
- **Role Attributes**: Proper semantic roles for all components

### Visual Feedback
- **Keyboard Mode Detection**: Enhanced focus styles appear when using Tab key
- **Hover States**: Visual feedback on interactive elements
- **Loading States**: Proper indication when actions are processing

## Tips for Keyboard Users

1. **Start with Tab**: Press Tab when you load any page to see the skip link
2. **Use Arrow Keys**: Many list-based interfaces support arrow key navigation
3. **Look for Hints**: Some buttons show keyboard shortcut hints in tooltips
4. **Try Number Keys**: In quiz attemptpages, use 1-4 to quickly select answers
5. **Escape is Your Friend**: Pressing Escape will close most overlays and dialogs

## Browser Considerations

### Chrome/Edge
- Full support for all keyboard shortcuts
- Best experience for screen readers

### Firefox
- Full support for all keyboard shortcuts
- Excellent ARIA support

### Safari
- Full support for keyboard shortcuts
- May require enabling "Tab highlights each item on a webpage" in Preferences > Advanced

## Reporting Issues

If you encounter any keyboard navigation issues:
1. Note the specific page and action
2. Document the expected vs actual behavior
3. Report through the accessibility feedback form

## Future Enhancements

Planned keyboard navigation improvements:
- Custom keyboard shortcut configuration
- Keyboard shortcut cheat sheet overlay (press ?)
- More granular quiz navigation options
- Enhanced table navigation with arrow keys

## For Developers

### Adding Keyboard Support to New Components

```javascript
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { KEYS } from '../utils/keyboardNavigation';

// In your component:
const { handleKeyDown } = useKeyboardNavigation({
  onEnter: handleSubmit,
  onEscape: handleClose,
});
```

### Testing Keyboard Navigation

1. Unplug your mouse
2. Navigate the entire application using only keyboard
3. Ensure all interactive elements are reachable
4. Verify focus indicators are visible
5. Test with screen readers (NVDA, JAWS, VoiceOver)

## Standards Compliance

Our keyboard navigation implementation follows:
- **WCAG 2.1 Level AA** guidelines
- **ARIA 1.2** specifications
- **W3C** keyboard navigation patterns
- **Section 508** compliance standards
