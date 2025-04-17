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
exports.resubmitItem = exports.getItemDetails = exports.featuredItem = exports.disapproveItem = exports.approveItem = exports.getUnapprovedItems = exports.deleteUser = exports.getUsers = void 0;
const prismaClient_1 = require("../prismaClient");
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prismaClient_1.prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                photo: true,
                isVerified: true,
                createdAt: true,
                _count: {
                    select: {
                        auctionItems: true,
                        bids: true
                    }
                }
            }
        });
        return res.json({ users });
    }
    catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ error: "Error fetching users" });
    }
});
exports.getUsers = getUsers;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const user = yield prismaClient_1.prisma.user.delete({
            where: { id: Number(userId) },
            //   include: {
            //     auctionItems: {
            //       select: {
            //         id: true,
            //         name: true,
            //         startingPrice: true,
            //         deadline: true,
            //         status: true,
            //         approvalStatus: true
            //       }
            //     },
            //     bids: {
            //       select: {
            //         id: true,
            //         price: true,
            //         auction: {
            //           select: {
            //             id: true,
            //             name: true,
            //             status: true
            //           }
            //         }
            //       }
            //     }
            //   }
        });
        return res.json({ message: "User deleted successfully" });
        return res.json({ user });
    }
    catch (error) {
        console.error("Error fetching user details:", error);
        return res.status(500).json({ error: "Error fetching user details" });
    }
});
exports.deleteUser = deleteUser;
const getUnapprovedItems = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const items = yield prismaClient_1.prisma.auctionItems.findMany({
            where: {
                approvalStatus: "PENDING"
            }
        });
        return res.json({
            items
        });
    }
    catch (e) {
        return res.json({
            Error: "Error fetching items"
        });
    }
});
exports.getUnapprovedItems = getUnapprovedItems;
const approveItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { itemId } = req.params;
    try {
        const updatedValue = yield prismaClient_1.prisma.auctionItems.update({
            where: {
                id: Number(itemId)
            },
            data: {
                approvalStatus: "APPROVED"
            }
        });
        return res.json({
            updatedValue
        });
    }
    catch (err) {
        console.error("Error approving item:", err);
        return res.status(500).json({ error: `Failed to approve item: ${err.message}` });
    }
});
exports.approveItem = approveItem;
const disapproveItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { itemId } = req.params;
    try {
        yield prismaClient_1.prisma.auctionItems.update({
            where: { id: Number(itemId) },
            data: { approvalStatus: "DISAPPROVED" },
        });
        return res.json({
            status: "Item successfully disapproved",
        });
    }
    catch (error) {
        console.error("Error disapproving item:", error);
        return res.status(500).json({ error: "Error disapproving item" });
    }
});
exports.disapproveItem = disapproveItem;
const featuredItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { itemId } = req.params;
    const { featured } = req.body;
    try {
        const updatedValue = yield prismaClient_1.prisma.auctionItems.update({
            where: {
                id: Number(itemId)
            },
            data: {
                featured
            }
        });
        return res.json({
            updatedValue
        });
    }
    catch (err) {
        return res.json({
            error: `Failed to update featured status: ${err.message}`
        });
    }
});
exports.featuredItem = featuredItem;
const getItemDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { itemId } = req.params;
    try {
        const item = yield prismaClient_1.prisma.auctionItems.findUnique({
            where: {
                id: Number(itemId)
            },
            select: {
                id: true,
                name: true,
                description: true,
                startingPrice: true,
                deadline: true,
                photo: true,
                status: true,
                approvalStatus: true,
                featured: true,
                user: {
                    select: {
                        name: true,
                        photo: true
                    }
                }
            }
        });
        if (!item) {
            return res.status(404).json({ error: "Item not found" });
        }
        return res.json({ item });
    }
    catch (err) {
        console.error("Error fetching item:", err);
        return res.status(500).json({ error: "Failed to fetch item" });
    }
});
exports.getItemDetails = getItemDetails;
const resubmitItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { itemId } = req.params;
    const { deadline } = req.body;
    try {
        const updatedValue = yield prismaClient_1.prisma.auctionItems.update({
            where: {
                id: Number(itemId)
            },
            data: {
                approvalStatus: "PENDING",
                deadline: deadline
            }
        });
        return res.json({
            updatedValue
        });
    }
    catch (err) {
        console.error("Error resubmitting item:", err);
        return res.status(500).json({ error: `Failed to resubmit item: ${err.message}` });
    }
});
exports.resubmitItem = resubmitItem;
