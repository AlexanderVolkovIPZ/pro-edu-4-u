import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

type HeaderProps = {
  auctionLink: string;
  setShowAlertDialog: (isShowedAlertDialog: boolean) => void;
};

const Header = ({ auctionLink, setShowAlertDialog }: HeaderProps) => {
  const router = useRouter();

  return (
    <div className='flex items-center justify-between'>
      <h5 className='text-rose-500 text-3xl font-bold'>Lot setup</h5>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className='cursor-pointer'>
            <BreadcrumbLink onClick={() => router.push(auctionLink)}>Auction</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Lot</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Trash2
        className='w-5 h-5 cursor-pointer hover:scale-110 transition hover:text-rose-600'
        onClick={() => setShowAlertDialog(true)}
      />
    </div>
  );
};

export default Header;
