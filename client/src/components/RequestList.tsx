import type { CapturedRequest } from '../types';
import { RequestCard } from './RequestCard';
import { EmptyState } from './EmptyState';

interface RequestListProps {
  requests: CapturedRequest[];
}

export function RequestList({ requests }: RequestListProps) {
  if (requests.length === 0) return <EmptyState />;

  return (
    <div className="space-y-3">
      {requests.map((req) => (
        <RequestCard key={req.id} request={req} />
      ))}
    </div>
  );
}
