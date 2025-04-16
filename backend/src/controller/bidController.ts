import { Kafka } from "kafkajs";
import { prisma } from "../prismaClient";

const kafka = new Kafka ({
  clientId: 'bid-producer',
  brokers: ['localhost:9092']
});

const producer = kafka.producer();
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
export const addBid=async (req: any, res: any) => {
  const { bidAmount, userId, auctionId } = req.body;
  if (!bidAmount || !userId || !auctionId) {
    return res.status(400).json({ 
      error: "Missing required fields. Please provide price, userId, and auctionId" 
    });
  }

  try {
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

    let processed = false;
    let attempts = 0;
    const maxAttempts = 10;
    const checkInterval = 500; // 500ms

    while (!processed && attempts < maxAttempts) {
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
}
export const getHighestBidder=async (req: any, res: any) => {
  const { auctionId } = req.params;
  const { HighestBidder, HighestPrice, secondHighestBid } = await HighestBidderInfo(auctionId);
  return res.json({
    HighestBidder,
    HighestPrice,
    secondHighestBid
  });
}