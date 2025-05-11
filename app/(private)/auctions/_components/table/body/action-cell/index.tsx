'use client';

import { useDeleteAuction } from '@/app/queries/auction';
import AlertDialog from '@/components/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TableCell } from '@/components/ui/table';
import { MoreHorizontal, Pencil, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

type ActionCellProps = {
  auctionId: string;
};

const ActionCell = ({ auctionId }: ActionCellProps) => {
  const router = useRouter();
  const { t } = useTranslation();

  const { mutateAsync: deleteAuction } = useDeleteAuction({});

  const [open, setOpen] = useState(false);
  const [isShowedAlertDialog, setIsShowedAlertDialog] = useState(false);

  const onDelete = async () => {
    try {
      await deleteAuction(auctionId);

      toast.success(t('toast.success.auction_deleted_successfully'));
    } catch {
      toast.error(t('toast.error.failed_to_delete_auction'));
    }
  };

  return (
    <>
      {isShowedAlertDialog &&
        AlertDialog({
          title: `${t('common.are_you_absolutely_sure')}?`,
          description: `${t('all_auctions.are_you_sure_you_want_to_delete_this_auction')}?`,
          cancelBtnTitle: t('common.cancel'),
          actionBtnTitle: t('common.continue'),
          setShowAlertDialog: setIsShowedAlertDialog,
          showAlertDialog: isShowedAlertDialog,
          onConfirm: onDelete,
        })}
      <TableCell className='px-6 py-2 whitespace-nowrap text-right'>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 p-0 focus-visible:ring-0 focus-visible:ring-transparent'
            >
              <MoreHorizontal className='h-5 w-5 hover:scale-[1.2] transition-all' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem
              onClick={() => router.push(`/auctions/${auctionId}`)}
              className='cursor-pointer flex items-center text-slate-600 hover:text-slate-700'
            >
              <Pencil className='mr-2 h-4 w-4' />
              {t('common.edit')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setIsShowedAlertDialog(true);
                setOpen(false);
              }}
              className='cursor-pointer flex items-center text-slate-600 hover:text-slate-700'
            >
              <Trash className='mr-2 h-4 w-4' />
              {t('common.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </>
  );
};

export default ActionCell;
