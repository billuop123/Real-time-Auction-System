import express from "express";

import { getHighestBidder } from "../controller/bidController";



export const bidRouter = express();

bidRouter.post("/addBid", );

bidRouter.get("/highest-bidder/:auctionId", getHighestBidder);
