import express from "express";
import { cloudinarySetup } from "../controller/cloudinaryController";
import {
  addItem,
  allItems,
  contactSeller,
  deleteItem,

  getFeaturedItems,

  getItem,
} from "../controller/itemController";
import { sendEmail } from "../mailer";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const itemRouter = express();
const upload = cloudinarySetup();
itemRouter.post("/additem", upload.single("photo"), addItem);
itemRouter.get("/allItems", allItems);
itemRouter.get("/featured", getFeaturedItems);
itemRouter.get("/:id", getItem);
itemRouter.delete("/:id", deleteItem);


itemRouter.post("/contact-seller", contactSeller);

