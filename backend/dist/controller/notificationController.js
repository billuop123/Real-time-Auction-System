"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearnotifications = exports.getNotificationsbyId = exports.newNotification = void 0;
const prismaClient_1 = require("../prismaClient");
const newNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { auctionId, userId } = req.body;
    const newNotification = yield prismaClient_1.prisma.notification.create({
        data: {
            auctionId: Number(auctionId),
            userId,
            seen: false,
        },
    });
    return res.json({
        status: "success",
    });
});
exports.newNotification = newNotification;
const getNotificationsbyId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const notifications = yield prismaClient_1.prisma.notification.findMany({
        where: {
            userId: Number(id),
            seen: false,
        },
        select: {
            message: true,
            auction: {
                select: {
                    photo: true,
                    name: true,
                },
            },
        },
    });
    return res.json({
        notifications,
    });
});
exports.getNotificationsbyId = getNotificationsbyId;
const clearnotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    try {
        const notifications = yield prismaClient_1.prisma.notification.findMany({
            where: {
                userId: id,
            },
        });
        if (notifications.length === 0) {
            return res
                .status(404)
                .json({ message: "No notifications found for the given user." });
        }
        const updatePromises = notifications.map((notification) => prismaClient_1.prisma.notification.update({
            where: {
                id: notification.id,
            },
            data: {
                seen: true,
            },
        }));
        yield Promise.all(updatePromises);
        res.status(200).json({
            message: "Notifications marked as seen for the user.",
        });
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ error: "An error occurred while updating notifications." });
    }
});
exports.clearnotifications = clearnotifications;
