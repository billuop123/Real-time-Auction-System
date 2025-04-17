import express from "express";

import { addBid, getHighestBidder } from "../controller/bidController";
import { authMiddleware } from "../middlewares/authmiddleware";



export const bidRouter = express();

bidRouter.post("/addBid",authMiddleware,addBid );

bidRouter.get("/highest-bidder/:auctionId", authMiddleware,getHighestBidder);
