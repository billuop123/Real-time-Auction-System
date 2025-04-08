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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bidRouter = void 0;
const express_1 = __importDefault(require("express"));
const kafkajs_1 = require("kafkajs");
const prismaClient_1 = require("../prismaClient");
const bidController_1 = require("../controller/bidController");
const kafka = new kafkajs_1.Kafka({
    clientId: 'bid-producer',
    brokers: ['localhost:9092']
});
const producer = kafka.producer();
exports.bidRouter = (0, express_1.default)();
exports.bidRouter.post("/addBid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { bidAmount, userId, auctionId } = req.body;
    // Validate required fields
    if (!bidAmount || !userId || !auctionId) {
        return res.status(400).json({
            error: "Missing required fields. Please provide price, userId, and auctionId"
        });
    }
    try {
        // Send bid to Kafka
        yield producer.connect();
        yield producer.send({
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
            const auction = yield prismaClient_1.prisma.auctionItems.findUnique({
                where: { id: Number(auctionId) },
                include: {
                    bids: {
                        orderBy: { price: 'desc' },
                        take: 1,
                        include: { user: true }
                    }
                }
            });
            if (((_a = auction === null || auction === void 0 ? void 0 : auction.bids[0]) === null || _a === void 0 ? void 0 : _a.price) === Number(bidAmount) &&
                ((_b = auction === null || auction === void 0 ? void 0 : auction.bids[0]) === null || _b === void 0 ? void 0 : _b.userId) === Number(userId)) {
                processed = true;
                break;
            }
            attempts++;
            yield new Promise(resolve => setTimeout(resolve, checkInterval));
        }
        if (!processed) {
            throw new Error("Bid processing timeout");
        }
        // Get the updated bid information
        const { HighestBidder, HighestPrice, secondHighestBid } = yield (0, bidController_1.HighestBidderInfo)(auctionId);
        return res.json({
            message: "Bid processed successfully",
            highestBidder: HighestBidder,
            highestPrice: HighestPrice,
            secondHighestBid
        });
    }
    catch (error) {
        console.error("Error processing bid:", error);
        return res.status(500).json({ error: "Failed to process bid" });
    }
    finally {
        yield producer.disconnect();
    }
}));
exports.bidRouter.get("/highest-bidder/:auctionId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { auctionId } = req.params;
    const { HighestBidder, HighestPrice, secondHighestBid } = yield (0, bidController_1.HighestBidderInfo)(auctionId);
    return res.json({
        HighestBidder,
        HighestPrice,
        secondHighestBid
    });
}));
