import { ACTIVITY_TYPES, ALERT_SEVERITY } from '../config/constants.js';

// Analyze user activity for suspicious behavior
export class ActivityAnalyzer {
  // Check for excessive tab switching
  static checkTabSwitching(activityLogs, threshold = 3) {
    const tabSwitches = activityLogs.filter(log => log.activityType === ACTIVITY_TYPES.TAB_CHANGE);
    return tabSwitches.length > threshold;
  }

  // Check for fullscreen exit
  static checkFullscreenExit(activityLogs) {
    return activityLogs.some(log => log.activityType === ACTIVITY_TYPES.FULLSCREEN_EXIT);
  }

  // Check for copy-paste attempts
  static checkCopyPasteAttempts(activityLogs) {
    const copyPaste = activityLogs.filter(
      log => log.activityType === ACTIVITY_TYPES.COPY_ATTEMPT || log.activityType === ACTIVITY_TYPES.PASTE_ATTEMPT
    );
    return copyPaste.length > 0;
  }

  // Check for window blur (user switched focus)
  static checkWindowBlur(activityLogs, threshold = 5) {
    const blurs = activityLogs.filter(log => log.activityType === ACTIVITY_TYPES.WINDOW_BLUR);
    return blurs.length > threshold;
  }

  // Calculate suspicion score (0-100)
  static calculateSuspicionScore(activityLogs, quizDuration) {
    let score = 0;

    // Tab switching - 20 points max
    const tabSwitches = activityLogs.filter(log => log.activityType === ACTIVITY_TYPES.TAB_CHANGE).length;
    score += Math.min(20, (tabSwitches / 5) * 20);

    // Fullscreen exits - 25 points per occurrence
    const fullscreenExits = activityLogs.filter(log => log.activityType === ACTIVITY_TYPES.FULLSCREEN_EXIT).length;
    score += fullscreenExits * 25;

    // Copy-paste attempts - 15 points max
    const copyPaste = activityLogs.filter(
      log => log.activityType === ACTIVITY_TYPES.COPY_ATTEMPT || log.activityType === ACTIVITY_TYPES.PASTE_ATTEMPT
    ).length;
    score += Math.min(15, (copyPaste / 3) * 15);

    // Window blur - 10 points max
    const blurs = activityLogs.filter(log => log.activityType === ACTIVITY_TYPES.WINDOW_BLUR).length;
    score += Math.min(10, (blurs / 10) * 10);

    // Right-click attempts - 10 points max
    const rightClicks = activityLogs.filter(log => log.activityType === ACTIVITY_TYPES.RIGHT_CLICK).length;
    score += Math.min(10, (rightClicks / 3) * 10);

    // Keyboard shortcuts - 10 points max
    const shortcuts = activityLogs.filter(log => log.activityType === ACTIVITY_TYPES.KEYBOARD_SHORTCUT).length;
    score += Math.min(10, (shortcuts / 5) * 10);

    return Math.min(100, score);
  }

  // Determine alert severity
  static getSeverityFromScore(score) {
    if (score >= 75) return ALERT_SEVERITY.CRITICAL;
    if (score >= 50) return ALERT_SEVERITY.HIGH;
    if (score >= 25) return ALERT_SEVERITY.MEDIUM;
    return ALERT_SEVERITY.LOW;
  }

  // Generate activity report
  static generateActivityReport(activityLogs) {
    return {
      totalActivities: activityLogs.length,
      tabSwitches: activityLogs.filter(log => log.activityType === ACTIVITY_TYPES.TAB_CHANGE).length,
      fullscreenExits: activityLogs.filter(log => log.activityType === ACTIVITY_TYPES.FULLSCREEN_EXIT).length,
      copyAttempts: activityLogs.filter(log => log.activityType === ACTIVITY_TYPES.COPY_ATTEMPT).length,
      pasteAttempts: activityLogs.filter(log => log.activityType === ACTIVITY_TYPES.PASTE_ATTEMPT).length,
      windowBlurs: activityLogs.filter(log => log.activityType === ACTIVITY_TYPES.WINDOW_BLUR).length,
      rightClicks: activityLogs.filter(log => log.activityType === ACTIVITY_TYPES.RIGHT_CLICK).length,
      keyboardShortcuts: activityLogs.filter(log => log.activityType === ACTIVITY_TYPES.KEYBOARD_SHORTCUT).length,
      pageVisibilityChanges: activityLogs.filter(log => log.activityType === ACTIVITY_TYPES.PAGE_VISIBILITY_CHANGE).length
    };
  }
}

export default ActivityAnalyzer;
