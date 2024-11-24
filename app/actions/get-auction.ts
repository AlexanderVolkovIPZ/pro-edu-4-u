import prismaDb from '@/lib/prismadb';

type AuctionProps = {
  auctionId: string;
};

export const getAuction = async ({ auctionId }: AuctionProps) => {
  try {
    const auction = await prismaDb.auction.findUnique({
      where: {
        id: auctionId,
      },
    });

    if (!auction) return null;

    return {
      ...auction,
      startDate: auction.startDate?.toUTCString(),
      endDate: auction.endDate?.toUTCString(),
    };
  } catch {
    return null;
  }
};
