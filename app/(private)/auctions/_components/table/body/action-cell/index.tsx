import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TableCell } from '@/components/ui/table';
import { MoreHorizontal, Pencil, Trash } from 'lucide-react';
import { useState } from 'react';
import AlertDialog from '@/components/alert-dialog';
import { useRouter } from 'next/navigation';
import { useDeleteAuction } from '@/app/queries/auction';
import toast from 'react-hot-toast';

type ActionCellProps = {
  auctionId: string;
};

const ActionCell = ({ auctionId }: ActionCellProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isShowedAlertDialog, setIsShowedAlertDialog] = useState(false);

  const { mutateAsync: deleteAuction, isPending: isDeleting } = useDeleteAuction({});

  const onDelete = async () => {
    try {
      await deleteAuction(auctionId);

      toast.success('Auction deleted successfully');
    } catch {
      toast.error('Failed to delete auction');
    }
  };

  return (
    <>
      {isShowedAlertDialog &&
        AlertDialog({
          title: 'Are you absolutely sure?',
          description: 'Are you sure you want to delete this auction?',
          cancelBtnTitle: 'Cancel',
          actionBtnTitle: 'Continue',
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
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setIsShowedAlertDialog(true);
                setOpen(false);
              }}
              className='cursor-pointer flex items-center text-slate-600 hover:text-slate-700'
            >
              <Trash className='mr-2 h-4 w-4' />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </>
  );
};

export default ActionCell;
