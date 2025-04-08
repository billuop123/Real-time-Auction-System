import express from "express";
import { Kafka } from 'kafkajs';
import { prisma } from "../prismaClient";
import { HighestBidderInfo } from "../controller/bidController";

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

    // Wait for the bid to be processed
    let processed = false;
    let attempts = 0;
    const maxAttempts = 10;
    const checkInterval = 500; // 500ms

    while (!processed && attempts < maxAttempts) {
      // Check if the bid was processed by looking at the highest bid
      const auction = await prisma.auctionItems.findUnique({
        where: { id: Number(auctionId) },
        include: {
          bids: {
            orderBy: { price: 'desc' },
            take: 1,
            include: { user: true }
          }
        }
      });

      if (auction?.bids[0]?.price === Number(bidAmount) && 
          auction?.bids[0]?.userId === Number(userId)) {
        processed = true;
        break;
      }

      attempts++;
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }

    if (!processed) {
      throw new Error("Bid processing timeout");
    }

    // Get the updated bid information
    const { HighestBidder, HighestPrice, secondHighestBid } = await HighestBidderInfo(auctionId);

    return res.json({
      message: "Bid processed successfully",
      highestBidder: HighestBidder,
      highestPrice: HighestPrice,
      secondHighestBid
    });
  } catch (error) {
    console.error("Error processing bid:", error);
    return res.status(500).json({ error: "Failed to process bid" });
  } finally {
    await producer.disconnect();
  }
});

bidRouter.get("/highest-bidder/:auctionId", async (req: any, res: any) => {
  const { auctionId } = req.params;
  const { HighestBidder, HighestPrice, secondHighestBid } = await HighestBidderInfo(auctionId);
  return res.json({
    HighestBidder,
    HighestPrice,
    secondHighestBid
  });
});
