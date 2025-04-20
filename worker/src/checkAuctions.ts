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
        status: 'PENDING' 
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


setInterval(checkEndedAuctions, 30000);


checkEndedAuctions().catch(console.error); 
