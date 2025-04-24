import { cn } from '@/lib/utils';
import { LotStatus } from '../../_shared/types';

const STATUS_MESSAGES = {
  UPCOMING: 'Bidding Process Starting Soon',
  IN_PROGRESS: 'Bidding Process In Progress',
  COMPLETED: 'Bid Process Is Finished',
};

export const StatusBadge = ({ status }: { status: LotStatus }) => {
  return (
    <div
      className={cn(
        'text-center font-medium p-2 rounded-md',
        status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
      )}
    >
      {STATUS_MESSAGES[status]}
    </div>
  );
};
