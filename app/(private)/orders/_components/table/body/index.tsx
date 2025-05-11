'use client';

import { formatDate } from '@/app/(private)/_utils/date-format';
import { AuthUserContext } from '@/app/providers/auth-user-provider';
import { OrderWithStringDates } from '@/app/queries/order';
import { useUpdateShipping } from '@/app/queries/shipping';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { TableBody as TableBodyComponent, TableCell, TableRow } from '@/components/ui/table';
import { ShippingStatus, UserRole } from '@prisma/client';
import { ChevronDown, SquareArrowOutUpRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useContext, useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

type TableBodyProps = {
  isLoading: boolean;
  orders: OrderWithStringDates[];
};

type EditableCell = {
  orderId: string;
  field: keyof Omit<TableBodyProps['orders'][number], 'id'>;
  value: string;
};

const Body = ({ isLoading, orders }: TableBodyProps) => {
  const authUser = useContext(AuthUserContext);
  const router = useRouter();
  const { t } = useTranslation();

  const { mutateAsync: updateShipping } = useUpdateShipping();

  const [editableCell, setEditableCell] = useState<EditableCell | null>(null);

  const onStatusClick = (orderId: string, status: string) =>
    setEditableCell({ orderId, field: 'status', value: status });

  const onUpdateStatus = async (value: ShippingStatus) => {
    if (!editableCell) return;

    const editableOrder = orders.find((order) => order.id === editableCell.orderId);
    if (!editableOrder) return;

    const existingStatus = editableOrder.status;
    const isStatusChanged = existingStatus !== value;

    const onClose = () => setEditableCell(null);

    if (!isStatusChanged) {
      onClose();
      return;
    }

    try {
      await updateShipping({
        id: editableCell.orderId,
        status: value,
      });

      toast.success(t('toast.success.status_updated_successfully'), {
        style: {
          textAlign: 'center',
        },
      });
    } catch {
      toast.error(t('toast.error.something_went_wrong'));
    } finally {
      onClose();
    }
  };

  const renderStatusCell = (orderId: string, status: string, ownerId: string) => {
    const hasPermissionToChange = authUser?.role === UserRole.ADMIN || ownerId === authUser?.id;
    const isEditable = hasPermissionToChange && editableCell?.orderId === orderId && editableCell?.field === 'status';

    if (isEditable) {
      const statusOptions = Object.values(ShippingStatus);

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' className='h-8 w-full justify-between'>
              {editableCell.value || 'Select status'}
              <ChevronDown className='ml-2 h-4 w-4 opacity-50' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='start' className='w-[200px]'>
            {statusOptions.map((statusOption) => (
              <DropdownMenuItem
                key={statusOption}
                onClick={async () => {
                  await onUpdateStatus(statusOption);
                }}
              >
                {statusOption}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    const getStatusClass = () => {
      switch (status) {
        case ShippingStatus.PENDING:
          return 'bg-gray-100 text-gray-800';
        case ShippingStatus.SHIPPED:
          return 'bg-blue-100 text-blue-800';
        case ShippingStatus.IN_TRANSIT:
          return 'bg-yellow-100 text-yellow-800';
        case ShippingStatus.DELIVERED:
          return 'bg-green-100 text-green-800';
        case ShippingStatus.CANCELED:
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div onClick={() => onStatusClick(orderId, status)} className='cursor-pointer'>
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass()}`}>
          {status}
        </span>
      </div>
    );
  };

  const renderSkeletonRows = () =>
    Array(5)
      .fill(0)
      .map((_, index) => (
        <TableRow key={`skeleton-${index}`}>
          <TableCell className='px-6 py-4 whitespace-nowrap'>
            <Skeleton className='h-5 w-32 mb-2' />
            <Skeleton className='h-4 w-24' />
          </TableCell>
          <TableCell className='px-6 py-4 whitespace-nowrap'>
            <Skeleton className='h-5 w-32 mb-2' />
            <Skeleton className='h-4 w-24' />
          </TableCell>
          <TableCell className='px-6 py-4 whitespace-nowrap'>
            <Skeleton className='h-5 w-32 mb-2' />
            <Skeleton className='h-4 w-24' />
          </TableCell>
          <TableCell className='px-6 py-4 whitespace-nowrap'>
            <Skeleton className='h-6 w-20' />
          </TableCell>
          <TableCell className='px-6 py-4 whitespace-nowrap'>
            <Skeleton className='h-5 w-32 mb-2' />
            <Skeleton className='h-4 w-28' />
          </TableCell>
          <TableCell className='px-6 py-4 whitespace-nowrap'>
            <Skeleton className='h-5 w-32 mb-2' />
            <Skeleton className='h-4 w-28' />
          </TableCell>
        </TableRow>
      ));

  const renderAuctionRows = () => {
    return orders.map((order, index) => {
      return (
        <TableRow key={order.id} className='hover:bg-gray-50 text-sm'>
          <TableCell className='px-6 py-2 whitespace-nowrap font-medium'>
            <span className='block text-gray-900'>
              {order.firstName} {order.lastName}
            </span>
            <span className='block text-gray-500'>
              {t('orders.order')} #{index + 1}
            </span>
          </TableCell>
          <TableCell className='px-6 py-2 whitespace-nowrap'>
            <span className='block text-gray-900'>{order.email}</span>
            <span className='block text-gray-500'>{order.phone}</span>
          </TableCell>
          <TableCell className='px-6 py-2 whitespace-nowrap text-gray-900'>
            <span className='block text-gray-900'>{order.address},</span>
            <span className='block text-gray-500'>
              {order.city}, {order.postalCode}
            </span>
          </TableCell>
          <TableCell
            role='link'
            className='px-6 py-2 whitespace-nowrap text-blue-500 hover:text-blue-800 underline transition duration-200 cursor-pointer'
            onClick={() => router.push(`/auctions/${order.lot.auction.id}/lots/${order.lot.id}/overview`)}
          >
            {order.lot.title}
          </TableCell>
          <TableCell className='px-6 py-2 whitespace-nowrap text-gray-500'>
            {renderStatusCell(order.id, order.status, order.lot.auction.userAuction.userId)}
          </TableCell>
          <TableCell className='px-6 py-2 whitespace-nowrap text-gray-900 font-medium'>
            <span className='block text-gray-900'>
              {t('orders.created')} {formatDate(order.createdAt)}
            </span>
            <span className='block text-gray-500'>
              {t('orders.updated')} {formatDate(order.updatedAt)}
            </span>
          </TableCell>
          <TableCell className='px-6 py-4 whitespace-nowrap text-gray-500'>
            <SquareArrowOutUpRight
              className='mr-2 h-4 w-4 hover:scale-110 hover:text-rose-500 transition-all cursor-pointer'
              onClick={() => {
                router.push(`/orders/${order.id}`);
              }}
            />
          </TableCell>
        </TableRow>
      );
    });
  };

  return (
    <TableBodyComponent className='bg-white divide-y divide-gray-200'>
      {isLoading ? renderSkeletonRows() : renderAuctionRows()}
    </TableBodyComponent>
  );
};

export default Body;
