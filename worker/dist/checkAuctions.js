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
    clientId: 'auction-checker',
    brokers: ['localhost:9092']
});
const producer = kafka.producer();
const checkEndedAuctions = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield producer.connect();
        const now = new Date();
        const endedAuctions = yield prismaClient_1.prisma.auctionItems.findMany({
            where: {
                deadline: {
                    lte: now
                },
                status: 'PENDING'
            }
        });
        for (const auction of endedAuctions) {
            yield producer.send({
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
    }
    catch (error) {
        console.error('Error checking auctions:', error);
    }
    finally {
        yield producer.disconnect();
    }
});
setInterval(checkEndedAuctions, 30000);
checkEndedAuctions().catch(console.error);
