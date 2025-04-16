import axios from "axios";
import express from "express";

import { prisma } from "../prismaClient";
import { createPayment, khaltiCallback } from "../controller/paymentController";
export const khaltiRouter = express();
khaltiRouter.post("/create", createPayment);


khaltiRouter.get("/callback", khaltiCallback );
