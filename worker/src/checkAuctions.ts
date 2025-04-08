import { Kafka } from 'kafkajs';
import { prisma } from './prismaClient';

const kafka = new Kafka({
  clientId: 'auction-checker',
  brokers: ['localhost:9092']
});

const producer = kafka.producer();

const checkEndedAuctions = async () => {
  try {
    await producer.connect();
    
    const now = new Date();
    const endedAuctions = await prisma.auctionItems.findMany({
      where: {
        deadline: {
          lte: now
        },
        status: 'PENDING' // Only check auctions that haven't been processed yet
      }
    });

    for (const auction of endedAuctions) {
      await producer.send({
        topic: 'auction-end',
        messages: [
          {
            value: JSON.stringify({
              auctionId: auction.id
            })
          }
        ]
      });
      console.log(`Sent auction end notification for auction ${auction.name}`);
    }
  } catch (error) {
    console.error('Error checking auctions:', error);
  } finally {
    await producer.disconnect();
  }
};

// Run the check every minute
setInterval(checkEndedAuctions, 60000);

// Run immediately on startup
checkEndedAuctions().catch(console.error); 
