import express from "express";
import { cloudinarySetup } from "../controller/cloudinaryController";
import {
  addItem,
  allItems,
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

// Contact seller endpoint
itemRouter.post("/contact-seller", async (req: any, res: any) => {
  const { itemId, buyerId, message } = req.body;
  
  try {
    // Get item and seller details
    const item = await prisma.auctionItems.findUnique({
      where: { id: Number(itemId) },
      include: { user: true }
    });

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Get buyer details
    const buyer = await prisma.user.findUnique({
      where: { id: Number(buyerId) }
    });

    if (!buyer) {
      return res.status(404).json({ error: "Buyer not found" });
    }

    // Send email to seller
    await sendEmail({
      email: item.user.email,
      emailType: "CONTACT",
      userId: item.userId.toString(),
      buyerName: buyer.name,
      buyerEmail: buyer.email,
      itemName: item.name,
      message: message
    });

    return res.json({
      message: "Contact request sent successfully"
    });
  } catch (error: any) {
    console.error("Error contacting seller:", error);
    return res.status(500).json({ error: "Failed to send contact request" });
  }
});

