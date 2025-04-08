"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const kafkajs_1 = require("kafkajs");
const prismaClient_1 = require("./prismaClient");
const kafka = new kafkajs_1.Kafka({
    clientId: 'bid-worker',
    brokers: ['localhost:9092']
});
const consumer = kafka.consumer({ groupId: 'bid-group' });
const producer = kafka.producer();
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Connecting to Kafka...');
        yield consumer.connect();
        yield producer.connect();
        console.log('Connected to Kafka successfully');
        console.log('Subscribing to topics...');
        yield consumer.subscribe({ topic: 'bids', fromBeginning: true });
        yield consumer.subscribe({ topic: 'auction-end', fromBeginning: true });
        console.log('Subscribed to topics successfully');
        yield consumer.run({
            eachMessage: (_a) => __awaiter(void 0, [_a], void 0, function* ({ topic, partition, message }) {
                console.log(`Received message from topic: ${topic}, partition: ${partition}`);
                if (!message.value) {
                    console.log('Message has no value, skipping');
                    return;
                }
                const data = JSON.parse(message.value.toString());
                if (topic === 'bids') {
                    console.log('Processing bid:', data);
                    try {
                        // Process the bid
                        const bid = yield prismaClient_1.prisma.bids.create({
                            data: {
                                price: data.price,
                                userId: data.userId,
                                auctionId: data.auctionId
                            }
                        });
                        // Update the auction's current price if the new bid is higher
                        const auction = yield prismaClient_1.prisma.auctionItems.findUnique({
                            where: { id: data.auctionId }
                        });
                        if (auction && data.price > auction.startingPrice) {
                            yield prismaClient_1.prisma.auctionItems.update({
                                where: { id: data.auctionId },
                                data: { startingPrice: data.price }
                            });
                            console.log(`Updated auction ${data.auctionId} price to ${data.price}`);
                        }
                        console.log('Bid processed successfully:', bid);
                    }
                    catch (error) {
                        console.error('Error processing bid:', error);
                    }
                }
                else if (topic === 'auction-end') {
                    console.log('Processing auction end:', data);
                    try {
                        const { auctionId } = data;
                        // Get the highest bidder
                        const highestBid = yield prismaClient_1.prisma.bids.findFirst({
                            where: { auctionId },
                            orderBy: { price: 'desc' },
                            include: { user: true }
                        });
                        if (highestBid) {
                            // Update auction status to WON
                            const auction = yield prismaClient_1.prisma.auctionItems.update({
                                where: { id: Number(auctionId) },
                                data: { status: "WON" }
                            });
                            // Create notification for the winner
                            yield prismaClient_1.prisma.notification.create({
                                data: {
                                    userId: highestBid.userId,
                                    auctionId,
                                    message: `Congratulations! You won the auction for Rs ${highestBid.price} for item ${auction.name}. Please complete the payment to claim your item.`
                                }
                            });
                            console.log(`Auction ${auctionId} ended. Winner: ${highestBid.user.name}`);
                        }
                        else {
                            // No bids, mark as UNSOLD
                            yield prismaClient_1.prisma.auctionItems.update({
                                where: { id: auctionId },
                                data: { status: 'UNSOLD' }
                            });
                            console.log(`Auction ${auctionId} ended with no bids`);
                        }
                    }
                    catch (error) {
                        console.error('Error processing auction end:', error);
                    }
                }
            })
        });
    }
    catch (error) {
        console.error('Error in consumer:', error);
    }
});
console.log('Starting bid worker...');
run().catch(console.error);
