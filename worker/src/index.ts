import { Kafka } from 'kafkajs';
import { prisma } from './prismaClient';

const kafka = new Kafka({
  clientId: 'bid-worker',
  brokers: ['localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'bid-group' });
const producer = kafka.producer();

const run = async () => {
  try {
    console.log('Connecting to Kafka...');
    await consumer.connect();
    await producer.connect();
    console.log('Connected to Kafka successfully');
    
    console.log('Subscribing to topics...');
    await consumer.subscribe({ topic: 'bids', fromBeginning: true });
    await consumer.subscribe({ topic: 'auction-end', fromBeginning: true });
    console.log('Subscribed to topics successfully');

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log(`Received message from topic: ${topic}, partition: ${partition}`);
        
        if (!message.value) {
          console.log('Message has no value, skipping');
          return;
        }

        const data = JSON.parse(message.value.toString());
        
        if (topic === 'bids') {
          console.log('Processing bid:', data);
          try {
       
            const bid = await prisma.bids.create({
              data: {
                price: data.price,
                userId: data.userId,
                auctionId: data.auctionId
              }
            });

            console.log('Bid processed successfully:', bid);
          } catch (error) {
            console.error('Error processing bid:', error);
          }
        } else if (topic === 'auction-end') {
          console.log('Processing auction end:', data);
          try {
            const { auctionId } = data;
            
  
            const highestBid = await prisma.bids.findFirst({
              where: { auctionId },
              orderBy: { price: 'desc' },
              include: { user: true }
            });

            if (highestBid) {
          
              const auction = await prisma.auctionItems.update({
                where: { id: Number(auctionId) },
                data: { status: "WON" }
              });

          
              const winner=await prisma.notification.create({
                data: {
                  userId: highestBid.userId,
                  auctionId,
                  message: `Congratulations! You won the auction for Rs ${highestBid.price} for item ${auction.name}. Please complete the payment to claim your item.`
                }
              });
              console.log(winner);
              console.log(`Auction ${auctionId} ended. Winner: ${highestBid.user.name}`);
            } else {
              // No bids, mark as UNSOLD
              await prisma.auctionItems.update({
                where: { id: auctionId },
                data: { status: 'UNSOLD' }
              });
              console.log(`Auction ${auctionId} ended with no bids`);
            }
          } catch (error) {
            console.error('Error processing auction end:', error);
          }
        } 
      }
    });
  } catch (error) {
    console.error('Error in consumer:', error);
  }
};

console.log('Starting bid worker...');
run().catch(console.error);
