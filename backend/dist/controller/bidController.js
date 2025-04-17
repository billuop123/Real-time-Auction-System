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
exports.getHighestBidder = exports.addBid = exports.HighestBidderInfo = void 0;
const kafkajs_1 = require("kafkajs");
const prismaClient_1 = require("../prismaClient");
const kafka = new kafkajs_1.Kafka({
    clientId: 'bid-producer',
    brokers: ['localhost:9092']
});
const producer = kafka.producer();
const HighestBidderInfo = (auctionId) => __awaiter(void 0, void 0, void 0, function* () {
    const bid = yield prismaClient_1.prisma.bids.findMany({
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
    const highestBid = bid.reduce((highest, current) => {
        return current.price > highest.price ? current : highest;
    }, bid[0]);
    const userIdWithHighestPrice = highestBid.userId;
    const HighestPrice = highestBid.price;
    const secondHighestBid = bid
        .filter((current) => current !==
        bid.reduce((highest, current) => {
            return current.price > highest.price ? current : highest;
        }, bid[0]))
        .reduce((secondHighest, current) => {
        return current.price > secondHighest.price ? current : secondHighest;
    }, bid[0]);
    const HighestBidder = yield prismaClient_1.prisma.user.findFirst({
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
        secondHighestBid: (secondHighestBid === null || secondHighestBid === void 0 ? void 0 : secondHighestBid.userId) || null
    };
});
exports.HighestBidderInfo = HighestBidderInfo;
const addBid = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { bidAmount, userId, auctionId } = req.body;
    if (!bidAmount || !userId || !auctionId) {
        return res.status(400).json({
            error: "Missing required fields. Please provide price, userId, and auctionId"
        });
    }
    try {
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
        let processed = false;
        let attempts = 0;
        const maxAttempts = 10;
        const checkInterval = 500; // 500ms
        while (!processed && attempts < maxAttempts) {
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
        const { HighestBidder, HighestPrice, secondHighestBid } = yield (0, exports.HighestBidderInfo)(auctionId);
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
});
exports.addBid = addBid;
const getHighestBidder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { auctionId } = req.params;
    const { HighestBidder, HighestPrice, secondHighestBid } = yield (0, exports.HighestBidderInfo)(auctionId);
    return res.json({
        HighestBidder,
        HighestPrice,
        secondHighestBid
    });
});
exports.getHighestBidder = getHighestBidder;
