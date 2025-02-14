'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { LotDetail } from '@prisma/client';
import { usePathname, useRouter } from 'next/navigation';
import { memo, useEffect, useState } from 'react';
import { tabsList } from '../../../_shared/lists/overview-tab-list';
import BidProcessInfo from './bid-process-info';
import DetailsInfo from './details-info';
import OverviewInfo from './overview-info';
import TabsList from './tabs-list';
import { LotOverviewInfo, LotStatus } from './_shared/types';

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
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState(tabsList[0].route);
  const {
    id,
    bids = [],
    status,
    isSold,
    details,
    startBid,
    buyNowBid,
    auctionId,
    categories,
    timeLotLeft,
    description,
    minBidIncrement,
  } = lotInfo;
  const shouldShowDetailsSection = details && !!details?.length;
  const initialBids = bids
    .map((bid) => ({
      id: bid.id,
      amount: bid.amount,
      bidderName: bid.user.name || 'Anonymous',
      bidderId: bid.user.id,
      createdAt: new Date(bid.createdAt).toISOString(),
    }))
    .sort((a, b) => b.amount - a.amount);

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

          <TabsContent value={tabsList[0].route}>
            <OverviewInfo
              id={id}
              isSold={isSold}
              startBid={startBid}
              buyNowBid={buyNowBid}
              minBidIncrement={minBidIncrement}
              categories={categories}
              description={description}
            />
          </TabsContent>

          {shouldShowDetailsSection && (
            <TabsContent value={tabsList[1].route}>
              <DetailsInfo lotDetails={details} />
            </TabsContent>
          )}

          <TabsContent value={tabsList[2].route}>
            <MemoizedBidProcessInfo
              lotId={id}
              startBid={startBid ?? 0}
              auctionId={auctionId}
              initialBids={initialBids}
              lotTimeLeft={timeLotLeft}
              minBidIncrement={minBidIncrement ?? 0}
              status={status}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RightColumn;
