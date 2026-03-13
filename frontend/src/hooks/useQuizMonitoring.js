import { useEffect, useRef } from 'react';
import {
  logActivity,
  triggerAutoSubmit,
  emitFullscreenExit,
  emitQuizLeft,
  emitTabSwitch,
  onTimerUpdate,
  offTimerUpdate
} from '../services/socketService.js';

export const useQuizMonitoring = (
  submissionId,
  quizId,
  studentId,
  institutionId,
  options = {}
) => {
  const isFullscreen = useRef(false);
  const violationCount = useRef(0);
  const { 
    violationLimit = 3, 
    onAutoSubmit,
    onTimerUpdate: onLocalTimerUpdate,
    proctoringSettings = {}
  } = options || {};
  
  const {
    enabled: proctoringEnabled = true,
    allowTabSwitching = false,
    requiresFullscreen = true,
    allowCopyPaste = false
  } = proctoringSettings;

  const incrementViolation = (reason) => {
    violationCount.current += 1;

    logActivity(
      submissionId,
      quizId,
      'violation',
      { reason, count: violationCount.current },
      studentId,
      institutionId
    );

    if (violationCount.current >= violationLimit) {
      logActivity(
        submissionId,
        quizId,
        'auto_submit_threshold_reached',
        { reason, count: violationCount.current },
        studentId,
        institutionId
      );

      triggerAutoSubmit({
        submissionId,
        quizId,
        studentId,
        reason: reason || 'violation_limit'
      });

      if (typeof onAutoSubmit === 'function') {
        onAutoSubmit();
      }
    }
  };

  useEffect(() => {
    if (!submissionId || !quizId || !studentId || !proctoringEnabled) {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.hidden && !allowTabSwitching) {
        logActivity(
          submissionId,
          quizId,
          'page_visibility_change',
          { isVisible: false },
          studentId,
          institutionId
        );

        emitTabSwitch({ submissionId, quizId, studentId, institutionId });

        incrementViolation('tab_switch');
      }
    };

    const handleFullscreenChange = () => {
      const fullscreenElement = document.fullscreenElement;
      if (!fullscreenElement && isFullscreen.current) {
        logActivity(
          submissionId,
          quizId,
          'fullscreen_exit',
          { timestamp: new Date().toISOString() },
          studentId,
          institutionId
        );

        emitFullscreenExit({ submissionId, quizId, studentId, institutionId });

        if (requiresFullscreen) {
          incrementViolation('fullscreen_exit');
        }
      }
      isFullscreen.current = !!fullscreenElement;
    };

    const handleKeyDown = (e) => {
      const isSuspiciousShortcut =
        (e.ctrlKey || e.metaKey) &&
        ['c', 'x', 'v', 'a', 's', 'p'].includes(e.key.toLowerCase());

      if (!isSuspiciousShortcut) {
        return;
      }

      if (!allowCopyPaste || ['a', 's', 'p'].includes(e.key.toLowerCase())) {
        if (!allowCopyPaste && ['c', 'x', 'v'].includes(e.key.toLowerCase())) {
          e.preventDefault();
        }

        logActivity(
          submissionId,
          quizId,
          'keyboard_shortcut',
          { key: e.key, ctrlKey: e.ctrlKey, metaKey: e.metaKey },
          studentId,
          institutionId
        );

        incrementViolation('keyboard_shortcut');
      }
    };

    const handleWindowBlur = () => {
      if (allowTabSwitching) {
        return;
      }

      logActivity(
        submissionId,
        quizId,
        'window_blur',
        { timestamp: new Date().toISOString() },
        studentId,
        institutionId
      );

      incrementViolation('window_blur');
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      logActivity(
        submissionId,
        quizId,
        'right_click',
        { x: e.clientX, y: e.clientY },
        studentId,
        institutionId
      );

      incrementViolation('right_click');
    };

    const handleClipboard = (e) => {
      const type = e.type || 'clipboard';

      if (!allowCopyPaste) {
        e.preventDefault();
      }

      logActivity(
        submissionId,
        quizId,
        type,
        { type, prevented: !allowCopyPaste },
        studentId,
        institutionId
      );

      if (!allowCopyPaste) {
        incrementViolation(type);
      }
    };

    const handleSelectStart = (e) => {
      if (!allowCopyPaste) {
        e.preventDefault();
      }

      logActivity(
        submissionId,
        quizId,
        'select_start',
        { prevented: !allowCopyPaste },
        studentId,
        institutionId
      );

      if (!allowCopyPaste) {
        incrementViolation('select_start');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleClipboard);
    document.addEventListener('paste', handleClipboard);
    document.addEventListener('cut', handleClipboard);
    document.addEventListener('selectstart', handleSelectStart);

    const handleTimerUpdate = (payload = {}) => {
      const remainingSeconds = payload.remainingSeconds ?? payload.remaining ?? null;
      if (typeof onLocalTimerUpdate === 'function') {
        onLocalTimerUpdate(payload);
      }
      if (remainingSeconds !== null && remainingSeconds <= 0) {
        triggerAutoSubmit({ submissionId, quizId, studentId, reason: 'time_expired' });
        if (typeof onAutoSubmit === 'function') {
          onAutoSubmit();
        }
      }
    };

    onTimerUpdate(handleTimerUpdate);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleClipboard);
      document.removeEventListener('paste', handleClipboard);
      document.removeEventListener('cut', handleClipboard);
      document.removeEventListener('selectstart', handleSelectStart);
      offTimerUpdate(handleTimerUpdate);
    };
  }, [
    submissionId,
    quizId,
    studentId,
    institutionId,
    proctoringEnabled,
    allowTabSwitching,
    allowCopyPaste,
    requiresFullscreen,
    violationLimit,
    onAutoSubmit,
    onLocalTimerUpdate
  ]);

  const enterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch (err) {
      console.error('Fullscreen request failed:', err);
    }
  };

  const exitFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      emitQuizLeft({ submissionId, quizId, studentId, institutionId });
      triggerAutoSubmit({ submissionId, quizId, studentId, reason: 'browser_closed' });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [submissionId, quizId, studentId, institutionId]);

  return { enterFullscreen, exitFullscreen };
};
