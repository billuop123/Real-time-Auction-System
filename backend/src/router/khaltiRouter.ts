import express from "express";
import { createPayment, khaltiCallback } from "../controller/paymentController";
import { authMiddleware } from "../middlewares/authmiddleware";
export const khaltiRouter = express();
khaltiRouter.post("/create",createPayment);


khaltiRouter.get("/callback", khaltiCallback );
