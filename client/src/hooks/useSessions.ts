import { useState } from 'react';

export interface Session {
  id: string;
  createdAt: string;
}

const STORAGE_KEY = 'hookbin-sessions';
const ACTIVE_KEY  = 'hookbin-active-session';
const MAX_SESSIONS = 20;

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function loadSessions(): Session[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Session[];
  } catch {}
  return [];
}

function saveSessions(sessions: Session[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function initSessions(): { sessions: Session[]; activeId: string } {
  let sessions = loadSessions();
  let activeId = localStorage.getItem(ACTIVE_KEY) ?? '';

  if (sessions.length === 0) {
    const first: Session = { id: generateId(), createdAt: new Date().toISOString() };
    sessions = [first];
    saveSessions(sessions);
  }

  if (!sessions.find((s) => s.id === activeId)) {
    activeId = sessions[0].id;
  }

  localStorage.setItem(ACTIVE_KEY, activeId);
  return { sessions, activeId };
}

interface UseSessionsResult {
  sessions: Session[];
  activeId: string;
  createSession: () => void;
  switchSession: (id: string) => void;
  deleteSession: (id: string) => void;
}

export function useSessions(): UseSessionsResult {
  const [{ sessions, activeId }, setState] = useState(initSessions);

  const createSession = () => {
    const newSession: Session = { id: generateId(), createdAt: new Date().toISOString() };
    setState((prev) => {
      const updated = [newSession, ...prev.sessions].slice(0, MAX_SESSIONS);
      saveSessions(updated);
      localStorage.setItem(ACTIVE_KEY, newSession.id);
      return { sessions: updated, activeId: newSession.id };
    });
  };

  const switchSession = (id: string) => {
    localStorage.setItem(ACTIVE_KEY, id);
    setState((prev) => ({ ...prev, activeId: id }));
  };

  const deleteSession = (id: string) => {
    setState((prev) => {
      const updated = prev.sessions.filter((s) => s.id !== id);
      if (updated.length === 0) {
        const fallback: Session = { id: generateId(), createdAt: new Date().toISOString() };
        updated.push(fallback);
      }
      saveSessions(updated);
      const newActive = prev.activeId === id ? updated[0].id : prev.activeId;
      localStorage.setItem(ACTIVE_KEY, newActive);
      return { sessions: updated, activeId: newActive };
    });
  };

  return { sessions, activeId, createSession, switchSession, deleteSession };
}
