'use client';

import { AuthUserContext } from '@/app/providers/auth-user-provider';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { BidType, LotDetail, Status } from '@prisma/client';
import { usePathname, useRouter } from 'next/navigation';
import { memo, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { tabsList } from '../../../_shared/lists/overview-tab-list';
import { LotOverviewInfo, LotStatus } from './_shared/types';
import BidProcessInfo from './bid-process-info';
import { BuyNowInfo } from './buy-now-info';
import DetailsInfo from './details-info';
import OverviewInfo from './overview-info';
import TabsList from './tabs-list';

const MemoizedBidProcessInfo = memo(BidProcessInfo, (prevProps, nextProps) => {
  return prevProps === nextProps;
});

type RightColumnProps = {
  lotInfo: {
    details?: LotDetail[];
    timeLotLeft: number;
    auctionId: string;
    status: LotStatus;
  } & LotOverviewInfo;
};

const RightColumn = ({ lotInfo }: RightColumnProps) => {
  const authUser = useContext(AuthUserContext);

  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();

  const [overviewTab, detailsTab, bidProcessTab, buyNowTab] = tabsList;
  const [activeTab, setActiveTab] = useState(overviewTab.route);

  const {
    id,
    bids = [],
    status,
    details,
    startBid,
    buyNowBid,
    auctionId,
    categories,
    timeLotLeft,
    description,
    minBidIncrement,
    title,
  } = lotInfo;

  const initialBids = bids
    .map((bid) => ({
      id: bid.id,
      amount: bid.amount,
      bidderName: bid.user.name || t('common.anonymous'),
      bidderId: bid.user.id,
      createdAt: new Date(bid.createdAt).toISOString(),
      type: bid.type,
    }))
    .sort((a, b) => b.amount - a.amount);

  const isBuyNowPurchase = !!bids.some(({ isWinner, type }) => isWinner && type === BidType.INSTANT);
  const isBoughtByCurrentUser = !!bids.some(({ bidderId, isWinner }) => bidderId === authUser?.id && isWinner);

  useEffect(() => {
    const currentHash = window.location.hash.slice(1);
    if (currentHash && tabsList.some((tab) => tab.route === currentHash)) {
      setActiveTab(currentHash);
    } else {
      setActiveTab(tabsList[0].route);
    }
  }, []);

  const onTabChange = (tab: string) => {
    setActiveTab(tab);
    router.replace(`${pathname}#${tab}`);
  };

  return (
    <Card>
      <CardContent className='p-6 flex flex-col gap-4'>
        <Tabs value={activeTab} onValueChange={onTabChange}>
          <TabsList shouldHideTabsNamesList={[]} />

          <TabsContent value={overviewTab.route}>
            <OverviewInfo
              startBid={startBid}
              buyNowBid={buyNowBid}
              categories={categories}
              description={description}
              minBidIncrement={minBidIncrement}
            />
          </TabsContent>

          <TabsContent value={detailsTab.route}>
            <DetailsInfo lotDetails={details} />
          </TabsContent>

          <TabsContent value={bidProcessTab.route}>
            <MemoizedBidProcessInfo
              lotId={id}
              status={status}
              startBid={startBid ?? 0}
              auctionId={auctionId}
              initialBids={initialBids}
              lotTimeLeft={timeLotLeft}
              minBidIncrement={minBidIncrement ?? 0}
            />
          </TabsContent>

          <TabsContent value={buyNowTab.route}>
            <BuyNowInfo
              lotId={id}
              lotName={title}
              auctionId={auctionId}
              buyNowBid={buyNowBid}
              shouldHideBuyNowDetails={status !== Status.UPCOMING || !buyNowBid}
              isBuyNowPurchase={isBuyNowPurchase}
              isBoughtByCurrentUser={isBoughtByCurrentUser}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RightColumn;
