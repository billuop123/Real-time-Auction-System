import express from "express";
import { Kafka } from 'kafkajs';
import { prisma } from "../prismaClient";

const kafka = new Kafka({
  clientId: 'bid-producer',
  brokers: ['localhost:9092']
});

const producer = kafka.producer();

export const bidRouter = express();

bidRouter.post("/addBid", async (req: any, res: any) => {
  const { bidAmount, userId, auctionId } = req.body;

  // Validate required fields
  if (!bidAmount || !userId || !auctionId) {
    return res.status(400).json({ 
      error: "Missing required fields. Please provide price, userId, and auctionId" 
    });
  }

  try {
    // Send bid to Kafka
    await producer.connect();
    await producer.send({
      topic: 'bids',
      messages: [
        {
          value: JSON.stringify({
            price: Number(bidAmount),
            userId: Number(userId),
            auctionId: Number(auctionId)
          })
        }
      ]
    });
    await producer.disconnect();

    return res.json({
      message: "Bid request sent for processing"
    });
  } catch (error) {
    console.error("Error sending bid to Kafka:", error);
    return res.status(500).json({ error: "Failed to process bid" });
  }
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
