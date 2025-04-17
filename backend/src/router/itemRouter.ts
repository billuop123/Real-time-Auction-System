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
import { authMiddleware } from "../middlewares/authmiddleware";
export const itemRouter = express();
const upload = cloudinarySetup();
itemRouter.post("/additem", authMiddleware,upload.single("photo"), addItem);
itemRouter.get("/allItems",allItems);
itemRouter.get("/featured",getFeaturedItems);
itemRouter.get("/:id", authMiddleware,getItem);
itemRouter.delete("/:id", authMiddleware,deleteItem);


itemRouter.post("/contact-seller", contactSeller);

