import express from "express";
import { prisma } from "../prismaClient";
export const bidRouter = express();
bidRouter.post("/add-bid", async (req: any, res: any) => {
  const { bidAmount, userId, auctionId } = req.body;
  const newBid = await prisma.bids.create({
    data: {
      price: bidAmount,
      userId,
      auctionId,
    },
  });
  return res.json({
    newBid,
  });
});

bidRouter.get("/highest-bidder/:auctionId", async (req: any, res: any) => {
  const { auctionId } = req.params;
  const bid = await prisma.bids.findMany({
    where: {
      auctionId: Number(auctionId),
    },
  });
  if (bid.length === 0) {
    return res.json({
      HighestBidder: "no bids",
    });
  }
  const highestBid = bid.reduce((highest: any, current: any) => {
    return current.price > highest.price ? current : highest;
  }, bid[0]);

  const userIdWithHighestPrice = highestBid.userId;
  const HighestPrice = highestBid.price;
  console.log(bid);

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
  console.log(highestBid, secondHighestBid);
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
  return res.json({
    HighestBidder,
    HighestPrice,
    secondHighestBid: secondHighestBid.userId,
  });
});
