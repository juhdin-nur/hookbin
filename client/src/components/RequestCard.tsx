import { useState } from 'react';
import type { CapturedRequest, UploadedFile } from '../types';

interface RequestCardProps {
  request: CapturedRequest;
}

const METHOD_STYLES: Record<string, string> = {
  GET:     'bg-blue-100 text-blue-700',
  POST:    'bg-emerald-100 text-emerald-700',
  PUT:     'bg-amber-100 text-amber-700',
  PATCH:   'bg-orange-100 text-orange-700',
  DELETE:  'bg-red-100 text-red-700',
};

const METHOD_BORDER: Record<string, string> = {
  GET:    'border-l-blue-400',
  POST:   'border-l-emerald-400',
  PUT:    'border-l-amber-400',
  PATCH:  'border-l-orange-400',
  DELETE: 'border-l-red-400',
};

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function formatBody(body: unknown): string {
  if (body === null || body === undefined || body === '') return '(empty)';
  if (typeof body === 'object') return JSON.stringify(body, null, 2);
  return String(body);
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function FilesTable({ files }: { files: UploadedFile[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-100">
      <table className="w-full text-xs font-mono">
        <thead>
          <tr className="bg-slate-100 text-slate-500 text-left">
            <th className="px-3 py-2 font-semibold">Field</th>
            <th className="px-3 py-2 font-semibold">Filename</th>
            <th className="px-3 py-2 font-semibold">Content-Type</th>
            <th className="px-3 py-2 font-semibold text-right">Size</th>
          </tr>
        </thead>
        <tbody>
          {files.map((f, i) => (
            <tr key={i} className="border-t border-slate-100 bg-white hover:bg-slate-50">
              <td className="px-3 py-2 text-indigo-600">{f.field}</td>
              <td className="px-3 py-2 text-slate-700 break-all">{f.filename}</td>
              <td className="px-3 py-2 text-emerald-600">{f.mimetype}</td>
              <td className="px-3 py-2 text-slate-500 text-right whitespace-nowrap">{formatSize(f.size)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface CollapsibleSectionProps {
  label: string;
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function CollapsibleSection({ label, count, defaultOpen = false, children }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-slate-100 pt-3 mt-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
      >
        <span className={`transition-transform ${open ? 'rotate-90' : ''}`}>▶</span>
        {label}
        {count !== undefined && (
          <span className="ml-1 bg-slate-100 text-slate-500 rounded-full px-1.5 py-0.5 text-[10px]">
            {count}
          </span>
        )}
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}

export function RequestCard({ request }: RequestCardProps) {
  const methodStyle = METHOD_STYLES[request.method] ?? 'bg-slate-100 text-slate-700';
  const borderStyle = METHOD_BORDER[request.method] ?? 'border-l-slate-400';
  const bodyText = formatBody(request.body);
  const hasBody = bodyText !== '(empty)';
  const queryEntries = Object.entries(request.query);
  const headerEntries = Object.entries(request.headers);
  const fileEntries = request.files ?? [];

  return (
    <div className={`bg-white border border-slate-200 border-l-4 ${borderStyle} rounded-xl p-4 shadow-sm`}>
      {/* Header row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${methodStyle}`}>
            {request.method}
          </span>
          <span className="text-xs text-slate-400">{formatTimestamp(request.timestamp)}</span>
        </div>
        <span className="text-xs text-slate-400 font-mono">{request.ip}</span>
      </div>

      {/* Body */}
      <CollapsibleSection label="Body">
        <pre className="text-xs bg-slate-50 border border-slate-100 rounded-lg p-3 overflow-x-auto text-slate-700 leading-relaxed">
          {hasBody ? bodyText : <span className="text-slate-400 italic">(empty)</span>}
        </pre>
      </CollapsibleSection>

      {/* Query params */}
      {queryEntries.length > 0 && (
        <CollapsibleSection label="Query Params" count={queryEntries.length}>
          <div className="space-y-1">
            {queryEntries.map(([k, v]) => (
              <div key={k} className="flex gap-2 text-xs font-mono">
                <span className="text-indigo-600 shrink-0">{k}</span>
                <span className="text-slate-400">=</span>
                <span className="text-slate-700 break-all">{v}</span>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Files */}
      {fileEntries.length > 0 && (
        <CollapsibleSection label="Files" count={fileEntries.length} defaultOpen>
          <FilesTable files={fileEntries} />
        </CollapsibleSection>
      )}

      {/* Headers */}
      <CollapsibleSection label="Headers" count={headerEntries.length}>
        <div className="space-y-1">
          {headerEntries.map(([k, v]) => (
            <div key={k} className="flex gap-2 text-xs font-mono">
              <span className="text-indigo-600 shrink-0">{k}</span>
              <span className="text-slate-400">:</span>
              <span className="text-slate-700 break-all">{v}</span>
            </div>
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );
}
