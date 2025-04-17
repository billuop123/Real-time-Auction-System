"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bidRouter = void 0;
const express_1 = __importDefault(require("express"));
const bidController_1 = require("../controller/bidController");
const authmiddleware_1 = require("../middlewares/authmiddleware");
exports.bidRouter = (0, express_1.default)();
exports.bidRouter.post("/addBid", authmiddleware_1.authMiddleware, bidController_1.addBid);
exports.bidRouter.get("/highest-bidder/:auctionId", authmiddleware_1.authMiddleware, bidController_1.getHighestBidder);
