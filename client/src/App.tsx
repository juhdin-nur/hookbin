import { useSessions } from './hooks/useSessions';
import { useWebhook } from './hooks/useWebhook';
import { WebhookUrl } from './components/WebhookUrl';
import { CurlTemplates } from './components/CurlTemplates';
import { RequestList } from './components/RequestList';

const STATUS_INDICATOR: Record<string, string> = {
  connected:    'bg-emerald-400',
  connecting:   'bg-amber-400 animate-pulse',
  disconnected: 'bg-red-400',
};

export default function App() {
  const { sessions, activeId, createSession, switchSession, deleteSession } = useSessions();
  const { requests, status, clearRequests } = useWebhook(activeId);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-indigo-600">Hookbin</span>
            <div className="flex items-center gap-1.5 ml-3">
              <span className={`w-2 h-2 rounded-full ${STATUS_INDICATOR[status]}`} />
              <span className="text-xs text-slate-400 capitalize">{status}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">
              {requests.length} request{requests.length !== 1 ? 's' : ''}
            </span>
            {requests.length > 0 && (
              <button
                onClick={clearRequests}
                className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <WebhookUrl
          sessions={sessions}
          activeId={activeId}
          onNew={createSession}
          onSwitch={switchSession}
          onDelete={deleteSession}
        />
        <CurlTemplates activeId={activeId} />
        <RequestList requests={requests} />
      </main>
    </div>
  );
}
