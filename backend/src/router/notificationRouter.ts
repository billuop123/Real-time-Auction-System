import express from "express";
import { getNotificationsbyId, newNotification, clearnotifications } from "../controller/notificationController";
export const notificationRouter = express();
notificationRouter.post("/new-notification",newNotification);
notificationRouter.get("/:id", getNotificationsbyId);
notificationRouter.put("/clearnotifications", clearnotifications);
