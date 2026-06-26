export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">📭</div>
      <h3 className="text-lg font-semibold text-slate-700 mb-1">Waiting for requests</h3>
      <p className="text-sm text-slate-400 max-w-xs">
        Send any HTTP request to the URL above and it will appear here instantly.
      </p>
      <pre className="mt-4 text-xs bg-slate-100 rounded-lg px-4 py-3 text-slate-600 text-left">
        curl -X POST &lt;your-url&gt; \{'\n'}
        {'  '}-H "Content-Type: application/json" \{'\n'}
        {'  '}-d '{"{"}"hello":"world"{"}"}'
      </pre>
    </div>
  );
}
