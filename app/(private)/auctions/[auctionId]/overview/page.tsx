import AuctionOverview from './_components/auction-overview';

type AuctionOverviewPageParams = {
  auctionId: string;
};

const AuctionOverviewPage = ({ params }: { params: AuctionOverviewPageParams }) => {
  return <AuctionOverview auctionId={params.auctionId} />;
};

export default AuctionOverviewPage;
