"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRouter = void 0;
const express_1 = __importDefault(require("express"));
const notificationController_1 = require("../controller/notificationController");
const authmiddleware_1 = require("../middlewares/authmiddleware");
exports.notificationRouter = (0, express_1.default)();
exports.notificationRouter.post("/new-notification", authmiddleware_1.authMiddleware, notificationController_1.newNotification);
exports.notificationRouter.get("/:id", authmiddleware_1.authMiddleware, notificationController_1.getNotificationsbyId);
exports.notificationRouter.put("/clearnotifications", authmiddleware_1.authMiddleware, notificationController_1.clearnotifications);
