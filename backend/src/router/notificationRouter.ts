import express from "express";
import { getNotificationsbyId, newNotification, clearnotifications } from "../controller/notificationController";
import { authMiddleware } from "../middlewares/authmiddleware";
export const notificationRouter = express();
notificationRouter.post("/new-notification",authMiddleware,newNotification);
notificationRouter.get("/:id", authMiddleware,getNotificationsbyId);
notificationRouter.put("/clearnotifications", authMiddleware,clearnotifications);
