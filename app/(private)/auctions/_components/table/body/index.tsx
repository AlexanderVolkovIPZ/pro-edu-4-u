import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TableBody as TableBodyComponent, TableCell, TableRow } from '@/components/ui/table';
import ActionCell from './action-cell';

type TableBodyProps = {
  isLoading: boolean;
  auctions: {
    id: string;
    title: string;
    isPublished: boolean;
    status: string;
    startDate: string;
    endDate: string;
    createdAt: string;
    lotCount: number;
    bidCount: number;
  }[];
};

const Body = ({ isLoading, auctions }: TableBodyProps) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      IN_PROGRESS: { class: 'bg-green-100 text-green-800', label: 'IN PROGRESS' },
      UPCOMING: { class: 'bg-blue-100 text-blue-800', label: 'UPCOMING' },
      COMPLETED: { class: 'bg-gray-100 text-gray-800', label: 'COMPLETED' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      class: 'bg-gray-100 text-gray-800',
      label: status,
    };

    return (
      <Badge variant='outline' className={`${config.class} border-none`}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (date: string | null) => {
    if (!date) return '—';
    const dateObj = new Date(date);
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');

    return `${month}/${day}/${year} ${hours}:${minutes}`;
  };

  const renderSkeletonRows = () =>
    Array(5)
      .fill(0)
      .map((_, index) => (
        <TableRow key={`skeleton-${index}`}>
          <TableCell className='px-6 py-4 whitespace-nowrap'>
            <Skeleton className='h-5 w-32' />
          </TableCell>
          <TableCell className='px-6 py-4 whitespace-nowrap'>
            <Skeleton className='h-5 w-32' />
          </TableCell>
          <TableCell className='px-6 py-4 whitespace-nowrap'>
            <Skeleton className='h-5 w-32' />
          </TableCell>
          <TableCell className='px-6 py-4 whitespace-nowrap'>
            <Skeleton className='h-5 w-32' />
          </TableCell>
          <TableCell className='px-6 py-4 whitespace-nowrap'>
            <Skeleton className='h-5 w-8' />
          </TableCell>
          <TableCell className='px-6 py-4 whitespace-nowrap'>
            <Skeleton className='h-5 w-8' />
          </TableCell>
          <TableCell className='px-6 py-4 whitespace-nowrap'>
            <Skeleton className='h-6 w-6 ml-2' />
          </TableCell>
        </TableRow>
      ));

  const renderAuctionRows = () => {
    return auctions.map((auction) => (
      <TableRow key={auction.id} className='hover:bg-gray-50 text-sm'>
        <TableCell className='px-6 py-2 whitespace-nowrap text-gray-900 font-medium'>{auction.title}</TableCell>
        <TableCell className='px-6 py-2 whitespace-nowrap'>{getStatusBadge(auction.status)}</TableCell>
        <TableCell className='px-6 py-2 whitespace-nowrap text-gray-500'>{formatDate(auction.startDate)}</TableCell>
        <TableCell className='px-6 py-2 whitespace-nowrap text-gray-500'>{formatDate(auction.endDate)}</TableCell>
        <TableCell className='px-6 py-2 whitespace-nowrap text-gray-900 font-medium'>{auction.lotCount}</TableCell>
        <TableCell className='px-6 py-2 whitespace-nowrap text-gray-900 font-medium'>{auction.bidCount}</TableCell>
        <ActionCell auctionId={auction.id} key={auction.id} />
      </TableRow>
    ));
  };

  return (
    <TableBodyComponent className='bg-white divide-y divide-gray-200'>
      {isLoading ? renderSkeletonRows() : renderAuctionRows()}
    </TableBodyComponent>
  );
};

export default Body;
