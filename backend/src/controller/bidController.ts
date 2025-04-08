import { prisma } from "../prismaClient";

export const HighestBidderInfo = async (auctionId: string) => {
  const bid = await prisma.bids.findMany({
    where: {
      auctionId: Number(auctionId),
    },
  });
  
  if (bid.length === 0) {
    return {
      HighestBidder: "no bids",
      HighestPrice: 0,
      secondHighestBid: null
    };
  }
  
  const highestBid = bid.reduce((highest: any, current: any) => {
    return current.price > highest.price ? current : highest;
  }, bid[0]);

  const userIdWithHighestPrice = highestBid.userId;
  const HighestPrice = highestBid.price;

  const secondHighestBid = bid
    .filter(
      (current: any) =>
        current !==
        bid.reduce((highest: any, current: any) => {
          return current.price > highest.price ? current : highest;
        }, bid[0])
    )
    .reduce((secondHighest: any, current: any) => {
      return current.price > secondHighest.price ? current : secondHighest;
    }, bid[0]);

  const HighestBidder = await prisma.user.findFirst({
    where: {
      id: userIdWithHighestPrice,
    },
    select: {
      name: true,
      photo: true,
      id: true,
    },
  });

  return {
    HighestBidder,
    HighestPrice,
    secondHighestBid: secondHighestBid?.userId || null
  };
}; 