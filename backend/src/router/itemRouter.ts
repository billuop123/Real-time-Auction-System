import express from "express";
import { cloudinarySetup } from "../controller/cloudinaryController";
import {
  addItem,
  allItems,
  deleteItem,
  getItem,
} from "../controller/itemController";
export const itemRouter = express();
const upload = cloudinarySetup();
itemRouter.post("/additem", upload.single("photo"), addItem);
itemRouter.get("/allItems", allItems);
itemRouter.get("/:id", getItem);
itemRouter.delete("/:id", deleteItem);
