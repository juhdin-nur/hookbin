import { useState } from 'react';
import type { Session } from '../hooks/useSessions';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3001';

interface WebhookUrlProps {
  sessions: Session[];
  activeId: string;
  onNew: () => void;
  onSwitch: (id: string) => void;
  onDelete: (id: string) => void;
}

type CopyState = 'idle' | 'copied';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function WebhookUrl({ sessions, activeId, onNew, onSwitch, onDelete }: WebhookUrlProps) {
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [showSessions, setShowSessions] = useState(false);

  const webhookUrl = `${BACKEND_URL}/${activeId}`;

  const handleCopy = () => {
    const copy = (text: string) => {
      if (navigator.clipboard) {
        return navigator.clipboard.writeText(text);
      }
      // Fallback untuk HTTP non-localhost (clipboard API diblokir browser)
      const el = document.createElement('textarea');
      el.value = text;
      el.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      return Promise.resolve();
    };

    copy(webhookUrl).then(() => {
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 2000);
    });
  };

  const handleSwitch = (id: string) => {
    onSwitch(id);
    setShowSessions(false);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDelete(id);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* URL aktif */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Webhook URL
          </p>
          <button
            onClick={onNew}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer flex items-center gap-1"
          >
            + New Endpoint
          </button>
        </div>

        <div className="flex items-center gap-2">
          <code className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 truncate">
            {webhookUrl}
          </code>
          <button
            onClick={handleCopy}
            className={`shrink-0 text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer ${
              copyState === 'copied'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {copyState === 'copied' ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-2">
          Send any HTTP request to this URL — it will appear below in real-time.
        </p>
      </div>

      {/* Toggle daftar session */}
      {sessions.length > 1 && (
        <div className="border-t border-slate-100">
          <button
            onClick={() => setShowSessions((v) => !v)}
            className="w-full px-4 py-2 flex items-center justify-between text-xs text-slate-400 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <span>{sessions.length} endpoint{sessions.length !== 1 ? 's' : ''}</span>
            <span className={`transition-transform ${showSessions ? 'rotate-180' : ''}`}>▼</span>
          </button>

          {showSessions && (
            <ul className="divide-y divide-slate-100 max-h-52 overflow-y-auto">
              {sessions.map((session) => (
                <li
                  key={session.id}
                  onClick={() => handleSwitch(session.id)}
                  className={`flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors ${
                    session.id === activeId ? 'bg-indigo-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {session.id === activeId && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                    )}
                    <code className={`text-xs truncate ${session.id === activeId ? 'text-indigo-700 font-semibold' : 'text-slate-600'}`}>
                      {BACKEND_URL}/{session.id}
                    </code>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    <span className="text-[10px] text-slate-400">{formatDate(session.createdAt)}</span>
                    {sessions.length > 1 && (
                      <button
                        onClick={(e) => handleDelete(e, session.id)}
                        className="text-slate-300 hover:text-red-400 transition-colors cursor-pointer text-xs"
                        title="Delete endpoint"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
