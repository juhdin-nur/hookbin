import type { CapturedRequest } from './types.js';

const MAX_PER_BUCKET = 100;

const store = new Map<string, CapturedRequest[]>();

export function getRequests(bucketId: string): CapturedRequest[] {
  return store.get(bucketId) ?? [];
}

export function addRequest(req: CapturedRequest): void {
  const existing = store.get(req.bucketId) ?? [];
  existing.unshift(req);
  if (existing.length > MAX_PER_BUCKET) {
    existing.pop();
  }
  store.set(req.bucketId, existing);
}

export function clearRequests(bucketId: string): void {
  store.delete(bucketId);
}
