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
const prismaClient_1 = require("../prismaClient");
exports.bidRouter = (0, express_1.default)();
exports.bidRouter.post("/add-bid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bidAmount, userId, auctionId } = req.body;
    const newBid = yield prismaClient_1.prisma.bids.create({
        data: {
            price: bidAmount,
            userId,
            auctionId,
        },
    });
    return res.json({
        newBid,
    });
}));
exports.bidRouter.get("/highest-bidder/:auctionId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { auctionId } = req.params;
    const bid = yield prismaClient_1.prisma.bids.findMany({
        where: {
            auctionId: Number(auctionId),
        },
    });
    if (bid.length === 0) {
        return res.json({
            HighestBidder: "no bids",
        });
    }
    const highestBid = bid.reduce((highest, current) => {
        return current.price > highest.price ? current : highest;
    }, bid[0]);
    const userIdWithHighestPrice = highestBid.userId;
    const HighestPrice = highestBid.price;
    console.log(bid);
    const secondHighestBid = bid
        .filter((current) => current !==
        bid.reduce((highest, current) => {
            return current.price > highest.price ? current : highest;
        }, bid[0]))
        .reduce((secondHighest, current) => {
        return current.price > secondHighest.price ? current : secondHighest;
    }, bid[0]);
    console.log(highestBid, secondHighestBid);
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
    return res.json({
        HighestBidder,
        HighestPrice,
        secondHighestBid: secondHighestBid.userId,
    });
}));
