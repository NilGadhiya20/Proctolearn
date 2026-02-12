import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '../components';
import {
  initializeSocket,
  onAlert,
  offAlert,
  onActivityLogged,
  offActivityLogged,
  onError,
  offError,
  onStudentJoined,
  offStudentJoined,
  onTabSwitchDetected,
  offTabSwitchDetected,
  onFullscreenExitDetected,
  offFullscreenExitDetected,
  onQuizLeft,
  offQuizLeft
} from '../services/socketService';

const statusMeta = {
  active: {
    label: 'Active',
    tone: 'text-emerald-700',
    pill: 'bg-emerald-100 text-emerald-800',
    icon: '🟢'
  },
  suspicious: {
    label: 'Suspicious',
    tone: 'text-amber-700',
    pill: 'bg-amber-100 text-amber-800',
    icon: '⚠'
  },
  left: {
    label: 'Left',
    tone: 'text-rose-700',
    pill: 'bg-rose-100 text-rose-800',
    icon: '🔴'
  }
};

const formatTime = (date) =>
  new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date);

export default function FacultyLiveMonitoring() {
  const [sessions, setSessions] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmState, setConfirmState] = useState({ open: false, studentId: null, studentName: '' });

  useEffect(() => {
    const socket = initializeSocket();

    const handleConnect = () => {
      setConnectionStatus('connected');
      setError('');
      setLoading(false);
    };

    const handleDisconnect = () => {
      setConnectionStatus('disconnected');
      setLoading(false);
    };

    const upsertSession = (id, name, updater) => {
      if (!id) return;
      setSessions((prev) => {
        const next = [...prev];
        const idx = next.findIndex((s) => s.id === id);
        const base =
          idx !== -1
            ? next[idx]
            : {
                id,
                name: name || 'Unknown',
                status: 'active',
                violations: 0,
                lastEvent: 'Connected',
                lastSeen: new Date()
              };
        const updated = updater(base);
        if (idx !== -1) next[idx] = updated;
        else next.push(updated);
        return next;
      });
      setLastUpdated(new Date());
    };

    const handleAlert = (payload = {}) => {
      const id = payload.studentId || payload.userId || payload.student_id || payload.student?.id || payload.submissionId;
      const name = payload.studentName || payload.student?.name || payload.name || 'Student';
      const reason = payload.message || payload.reason || payload.type || 'Suspicious activity detected';

      upsertSession(id, name, (base) => ({
        ...base,
        name,
        status: 'suspicious',
        violations: (base.violations || 0) + 1,
        lastEvent: reason,
        lastSeen: new Date()
      }));
    };

    const handleActivity = (payload = {}) => {
      const id = payload.studentId || payload.userId || payload.student_id || payload.student?.id || payload.submissionId;
      if (!id) return;
      const name = payload.studentName || payload.student?.name || payload.name || 'Student';
      const activity = payload.activityType || payload.type || 'Activity logged';

      upsertSession(id, name, (base) => ({
        ...base,
        name,
        status: base.status === 'left' ? 'left' : 'active',
        lastEvent: activity,
        lastSeen: new Date()
      }));
    };

    const handleError = (err) => {
      const message = typeof err === 'string' ? err : err?.message || 'Socket error';
      setError(message);
      setToast('Connection issue. Attempting to reconnect...');
    };

    const handleStudentJoined = (payload = {}) => {
      const id = payload.studentId || payload.userId || payload.student_id || payload.submissionId;
      const name = payload.studentName || payload.student?.name || payload.name || 'Student';
      upsertSession(id, name, (base) => ({
        ...base,
        name,
        status: 'active',
        lastEvent: 'Joined quiz',
        lastSeen: new Date()
      }));
      setToast(`${name} joined`);
      setLoading(false);
    };

    const handleTabSwitchDetected = (payload = {}) => {
      const id = payload.studentId || payload.userId || payload.student_id || payload.submissionId;
      const name = payload.studentName || payload.student?.name || payload.name || 'Student';
      upsertSession(id, name, (base) => ({
        ...base,
        name,
        status: 'suspicious',
        violations: (base.violations || 0) + 1,
        lastEvent: 'Tab switch detected',
        lastSeen: new Date()
      }));
      setToast(`${name} tab switched`);
    };

    const handleFullscreenExitDetected = (payload = {}) => {
      const id = payload.studentId || payload.userId || payload.student_id || payload.submissionId;
      const name = payload.studentName || payload.student?.name || payload.name || 'Student';
      upsertSession(id, name, (base) => ({
        ...base,
        name,
        status: 'suspicious',
        violations: (base.violations || 0) + 1,
        lastEvent: 'Fullscreen exit detected',
        lastSeen: new Date()
      }));
      setToast(`${name} exited fullscreen`);
    };

    const handleQuizLeft = (payload = {}) => {
      const id = payload.studentId || payload.userId || payload.student_id || payload.submissionId;
      const name = payload.studentName || payload.student?.name || payload.name || 'Student';
      upsertSession(id, name, (base) => ({
        ...base,
        name,
        status: 'left',
        lastEvent: 'Left quiz',
        lastSeen: new Date()
      }));
      setToast(`${name} left the quiz`);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    onAlert(handleAlert);
    onActivityLogged(handleActivity);
    onError(handleError);
    onStudentJoined(handleStudentJoined);
    onTabSwitchDetected(handleTabSwitchDetected);
    onFullscreenExitDetected(handleFullscreenExitDetected);
    onQuizLeft(handleQuizLeft);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      offAlert(handleAlert);
      offActivityLogged(handleActivity);
      offError(handleError);
      offStudentJoined(handleStudentJoined);
      offTabSwitchDetected(handleTabSwitchDetected);
      offFullscreenExitDetected(handleFullscreenExitDetected);
      offQuizLeft(handleQuizLeft);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const statusCounts = useMemo(() => {
    return sessions.reduce(
      (acc, s) => {
        acc.total += 1;
        if (s.status === 'active') acc.active += 1;
        if (s.status === 'suspicious') acc.suspicious += 1;
        if (s.status === 'left') acc.left += 1;
        acc.violations += s.violations || 0;
        return acc;
      },
      { total: 0, active: 0, suspicious: 0, left: 0, violations: 0 }
    );
  }, [sessions]);

  const resetViolations = (studentId, studentName) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              violations: 0,
              status: s.status === 'left' ? 'left' : 'active',
              lastEvent: 'Violations reset by faculty',
              lastSeen: new Date()
            }
          : s
      )
    );
    setToast(`${studentName || 'Student'} violations cleared`);
  };

  const openConfirm = (studentId, studentName) => {
    setConfirmState({ open: true, studentId, studentName });
  };

  const closeConfirm = () => setConfirmState({ open: false, studentId: null, studentName: '' });

  const handleConfirmReset = () => {
    resetViolations(confirmState.studentId, confirmState.studentName);
    closeConfirm();
  };

  const handleReconnect = () => {
    setConnectionStatus('connecting');
    setToast('Reconnecting...');
    const sock = initializeSocket();
    if (sock && !sock.connected) {
      sock.connect();
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wide">Faculty Live Monitoring</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Live Student Status</h1>
            <p className="text-sm text-slate-600">Real-time Socket.IO updates: status and violations per student.</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-semibold ${
                connectionStatus === 'connected'
                  ? 'bg-emerald-100 text-emerald-800'
                  : connectionStatus === 'connecting'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              <span className="text-lg">●</span>
              {connectionStatus === 'connected'
                ? 'Connected'
                : connectionStatus === 'connecting'
                ? 'Connecting...'
                : 'Disconnected'}
            </span>
            {lastUpdated && (
              <span className="text-xs text-slate-500">Updated {formatTime(lastUpdated)}</span>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {error}
          </div>
        )}

        {connectionStatus !== 'connected' && (
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow">
            <div className="h-3 w-3 animate-ping rounded-full bg-amber-400" />
            <span>Connection is {connectionStatus}. We’ll retry automatically.</span>
            <button
              onClick={handleReconnect}
              className="ml-auto rounded-md bg-slate-900 px-3 py-1 text-xs font-semibold text-white shadow hover:bg-slate-800"
            >
              Retry now
            </button>
          </div>
        )}

        {toast && (
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow" role="status">
            {toast}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total" value={statusCounts.total} />
          <StatCard label="Active" value={statusCounts.active} tone="emerald" />
          <StatCard label="Suspicious" value={statusCounts.suspicious} tone="amber" />
          <StatCard label="Violations" value={statusCounts.violations} tone="rose" />
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3 sm:px-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Live Sessions</h2>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">
                  <span>●</span> Active
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 font-semibold text-amber-700">
                  <span>●</span> Suspicious
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-1 font-semibold text-rose-700">
                  <span>●</span> Left
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Violations</th>
                  <th className="px-4 py-3">Last Event</th>
                  <th className="px-4 py-3">Last Seen</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                      <div className="mx-auto inline-flex items-center gap-2 text-slate-600">
                        <span className="h-3 w-3 animate-ping rounded-full bg-emerald-500" />
                        Connecting to live feed...
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && sessions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                      Waiting for live data... Trigger a quiz session or alerts to see updates.
                    </td>
                  </tr>
                )}

                {sessions.map((s) => {
                  const meta = statusMeta[s.status] || statusMeta.active;
                  return (
                    <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-800">{s.name}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${meta.pill}`}>
                          <span>{meta.icon}</span>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-slate-800">{s.violations ?? 0}</td>
                      <td className="px-4 py-3 text-slate-700">{s.lastEvent || '—'}</td>
                      <td className="px-4 py-3 text-slate-500">{s.lastSeen ? formatTime(new Date(s.lastSeen)) : '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow"
                            onClick={() => setToast(`${s.name} focus requested`)}
                          >
                            Focus
                          </button>
                          <button
                            className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 shadow-sm ring-1 ring-rose-100 transition hover:-translate-y-0.5 hover:bg-rose-100"
                            onClick={() => openConfirm(s.id, s.name)}
                          >
                            Reset
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {confirmState.open && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Reset violations?</h3>
            <p className="mt-2 text-sm text-slate-600">
              This will set violations to 0 for {confirmState.studentName || 'this student'}. Continue?
            </p>
            <div className="mt-4 flex justify-end gap-2 text-sm">
              <button
                onClick={closeConfirm}
                className="rounded-md px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="rounded-md bg-rose-600 px-4 py-2 font-semibold text-white shadow hover:bg-rose-700"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </MainLayout>
  );
}

function StatCard({ label, value, tone }) {
  const toneMap = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100'
  };
  const toneClass = tone ? toneMap[tone] : 'bg-slate-50 text-slate-800 border-slate-100';

  return (
    <div className={`rounded-xl border px-4 py-3 shadow-sm ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
