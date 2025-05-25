'use client';

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
import { useTranslation } from 'react-i18next';

type HeaderProps = {
  auctionLink: string;
  setShowAlertDialog: (isShowedAlertDialog: boolean) => void;
};

const Header = ({ auctionLink, setShowAlertDialog }: HeaderProps) => {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <div className='flex items-center justify-between'>
      <h5 className='text-rose-500 text-3xl font-bold'>{t('new_lot.lot_setup')}</h5>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className='cursor-pointer'>
            <BreadcrumbLink onClick={() => router.push(auctionLink)}>{t('new_lot.auction')}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{t('new_lot.lot')}</BreadcrumbPage>
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
