'use client';

import { AuthUserContext } from '@/app/providers/auth-user-provider';
import { Button } from '@/components/ui/button';
import { UserRole } from '@prisma/client';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

type HeaderProps = {
  isApproveButtonDisabled: boolean;
  isPublishButtonDisabled: boolean;
  onAuctionApprove: () => void;
  onAcutionPublish: () => void;
};

const Header = ({
  isApproveButtonDisabled,
  isPublishButtonDisabled,
  onAuctionApprove,
  onAcutionPublish,
}: HeaderProps) => {
  const authUser = useContext(AuthUserContext);
  const { t } = useTranslation();

  return (
    <div className='flex items-center justify-between'>
      <h5 className='text-rose-500 text-3xl font-bold'>{t('auction.auction_setup')}</h5>
      <div className='flex items-center gap-2'>
        {authUser?.role === UserRole.ADMIN && (
          <Button variant='outline' disabled={isApproveButtonDisabled} onClick={onAuctionApprove}>
            {t('auction.approve')}
          </Button>
        )}
        <Button variant='outline' disabled={isPublishButtonDisabled} onClick={onAcutionPublish}>
          {t('auction.publish')}
        </Button>
      </div>
    </div>
  );
};

export default Header;
