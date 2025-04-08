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
exports.HighestBidderInfo = void 0;
const prismaClient_1 = require("../prismaClient");
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
