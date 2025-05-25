'use client';

import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { LOT_STATUSES } from '@/app/constants';

const STATUS_MESSAGES = {
  UPCOMING: 'bidding_process_starting_soon',
  IN_PROGRESS: 'bidding_process_in_progress',
  COMPLETED: 'bidding_process_completed',
};

export const StatusBadge = ({ status }: { status: keyof typeof LOT_STATUSES }) => {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'text-center font-medium p-2 rounded-md',
        status === LOT_STATUSES.IN_PROGRESS ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
      )}
    >
      {t(`bid_process.${STATUS_MESSAGES[status]}`)}
    </div>
  );
};
