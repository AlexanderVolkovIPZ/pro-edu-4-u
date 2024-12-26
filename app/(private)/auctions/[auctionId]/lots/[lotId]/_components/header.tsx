import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const Header = ({ auctionLink }: { auctionLink: string }) => {
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
      <Button variant='outline'>Publish</Button>
    </div>
  );
};

export default Header;
