import { useState } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3001';

interface CurlTemplatesProps {
  activeId: string;
}

type Method = 'GET' | 'POST' | 'POST_FILE' | 'PUT' | 'PATCH' | 'DELETE';

const METHOD_LABELS: Record<Method, string> = {
  GET:       'GET',
  POST:      'POST',
  POST_FILE: 'Upload',
  PUT:       'PUT',
  PATCH:     'PATCH',
  DELETE:    'DELETE',
};

const METHOD_STYLES: Record<Method, string> = {
  GET:       'bg-blue-100 text-blue-700 hover:bg-blue-200',
  POST:      'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
  POST_FILE: 'bg-violet-100 text-violet-700 hover:bg-violet-200',
  PUT:       'bg-amber-100 text-amber-700 hover:bg-amber-200',
  PATCH:     'bg-orange-100 text-orange-700 hover:bg-orange-200',
  DELETE:    'bg-red-100 text-red-700 hover:bg-red-200',
};

const METHOD_ACTIVE: Record<Method, string> = {
  GET:       'ring-2 ring-blue-400',
  POST:      'ring-2 ring-emerald-400',
  POST_FILE: 'ring-2 ring-violet-400',
  PUT:       'ring-2 ring-amber-400',
  PATCH:     'ring-2 ring-orange-400',
  DELETE:    'ring-2 ring-red-400',
};

function buildTemplate(method: Method, url: string): string {
  switch (method) {
    case 'GET':
      return `curl "${url}?page=1&limit=10&search=john&sort=created_at&order=desc"`;

    case 'POST':
      return [
        `curl -X POST "${url}" \\`,
        `  -H "Content-Type: application/json" \\`,
        `  -d '{`,
        `    "name": "John Doe",`,
        `    "email": "john@example.com",`,
        `    "role": "user",`,
        `    "active": true`,
        `  }'`,
      ].join('\n');

    case 'POST_FILE':
      return [
        `curl -X POST "${url}" \\`,
        `  -F "avatar=@/home/user/photo.jpg" \\`,
        `  -F "user_id=42" \\`,
        `  -F "caption=Profile photo" \\`,
        `  -F "is_public=true"`,
      ].join('\n');

    case 'PUT':
      return [
        `curl -X PUT "${url}" \\`,
        `  -H "Content-Type: application/json" \\`,
        `  -d '{`,
        `    "id": 42,`,
        `    "name": "John Doe",`,
        `    "email": "john@example.com",`,
        `    "role": "admin",`,
        `    "active": true`,
        `  }'`,
      ].join('\n');

    case 'PATCH':
      return [
        `curl -X PATCH "${url}" \\`,
        `  -H "Content-Type: application/json" \\`,
        `  -d '{`,
        `    "id": 42,`,
        `    "status": "inactive",`,
        `    "updated_at": "2025-01-15T08:30:00Z"`,
        `  }'`,
      ].join('\n');

    case 'DELETE':
      return [
        `curl -X DELETE "${url}" \\`,
        `  -H "Content-Type: application/json" \\`,
        `  -d '{`,
        `    "id": 42,`,
        `    "reason": "user_request"`,
        `  }'`,
      ].join('\n');
  }
}

export function CurlTemplates({ activeId }: CurlTemplatesProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Method>('GET');
  const [copied, setCopied] = useState(false);

  const url = `${BACKEND_URL}/${activeId}`;
  const template = buildTemplate(active, url);

  const handleCopy = () => {
    const write = (text: string) => {
      if (navigator.clipboard) return navigator.clipboard.writeText(text);
      const el = document.createElement('textarea');
      el.value = text;
      el.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      return Promise.resolve();
    };
    write(template).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <span className="font-mono text-slate-400">$</span>
          curl Templates
        </span>
        <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {open && (
        <div className="border-t border-slate-100">
          {/* Method tabs */}
          <div className="flex flex-wrap gap-1.5 px-4 pt-3 pb-2">
            {(Object.keys(METHOD_LABELS) as Method[]).map((m) => (
              <button
                key={m}
                onClick={() => { setActive(m); setCopied(false); }}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer ${METHOD_STYLES[m]} ${active === m ? METHOD_ACTIVE[m] : ''}`}
              >
                {METHOD_LABELS[m]}
              </button>
            ))}
          </div>

          {/* Template code */}
          <div className="px-4 pb-4">
            <div className="relative">
              <pre className="text-xs font-mono bg-slate-950 text-slate-100 rounded-lg p-4 overflow-x-auto leading-relaxed pr-20">
                {template}
              </pre>
              <button
                onClick={handleCopy}
                className={`absolute top-2 right-2 text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  copied
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
