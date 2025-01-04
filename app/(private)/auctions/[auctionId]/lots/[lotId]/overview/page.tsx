import LotOverview from './_components/lot-overview';

type LotOverviewPageParams = {
  auctionId: string;
  lotId: string;
};
const LotOverviewPage = ({ params }: { params: LotOverviewPageParams }) => {
  return <LotOverview auctionId={params.auctionId} lotId={params.lotId} />;
};

export default LotOverviewPage;
