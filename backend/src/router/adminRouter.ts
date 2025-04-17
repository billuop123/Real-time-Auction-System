import express from "express";
import { approveItem, deleteUser, disapproveItem, featuredItem, getItemDetails, getUnapprovedItems, getUsers, resubmitItem } from "../controller/adminController";
import { adminMiddleware } from "../middlewares/adminmiddleware";
export const adminRouter = express();

adminRouter.get("/users",adminMiddleware,getUsers);
adminRouter.delete("/users/:userId", adminMiddleware,deleteUser);
adminRouter.get("/unapproveditems",getUnapprovedItems);
adminRouter.post("/items/:itemId/approve", adminMiddleware,approveItem);
adminRouter.post("/disapprove/:itemId",adminMiddleware,disapproveItem);
adminRouter.post("/featured/:itemId", adminMiddleware,featuredItem);
adminRouter.get("/items/:itemId",getItemDetails);
adminRouter.post("/items/:itemId/resubmit", adminMiddleware,resubmitItem);