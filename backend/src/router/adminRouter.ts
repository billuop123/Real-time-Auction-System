import express from "express";
import { approveItem, deleteUser, disapproveItem, featuredItem, getItemDetails, getUnapprovedItems, getUsers, resubmitItem } from "../controller/adminController";
export const adminRouter = express();

adminRouter.get("/users",getUsers);
adminRouter.delete("/users/:userId", deleteUser);
adminRouter.get("/unapproveditems", getUnapprovedItems);
adminRouter.post("/items/:itemId/approve", approveItem);
adminRouter.post("/disapprove/:itemId",disapproveItem);
adminRouter.post("/featured/:itemId", featuredItem);
adminRouter.get("/items/:itemId", getItemDetails);
adminRouter.post("/items/:itemId/resubmit", resubmitItem);