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
exports.contactSeller = exports.getFeaturedItems = exports.deleteItem = exports.getItem = exports.allItems = exports.addItem = void 0;
const mailer_1 = require("../mailer");
const prismaClient_1 = require("../prismaClient");
const addItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { name, description, photo, deadline, startingPrice, userId, category, } = req.body;
    if (!category) {
        category = "OTHERS";
    }
    const uploadedFile = req === null || req === void 0 ? void 0 : req.file;
    const photoPath = (uploadedFile === null || uploadedFile === void 0 ? void 0 : uploadedFile.path) || "default-placeholder-url";
    const defaultCategories = ["OTHERS"];
    const item = yield prismaClient_1.prisma.auctionItems.create({
        data: {
            name,
            description,
            photo: photoPath,
            deadline,
            startingPrice: Number(startingPrice),
            userId: Number(userId),
            category: category || defaultCategories,
        },
    });
    return res.json({
        item,
    });
});
exports.addItem = addItem;
const allItems = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { search, category } = req.query;
    if (!search && !category) {
        const allItems = yield prismaClient_1.prisma.auctionItems.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                photo: true,
                deadline: true,
                startingPrice: true,
                userId: true,
                approvalStatus: true,
                category: true,
                status: true,
                featured: true
            }
        });
        return res.json({
            allItems,
        });
    }
    if (search && !category) {
        try {
            const items = yield prismaClient_1.prisma.auctionItems.findMany({
                where: {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    photo: true,
                    deadline: true,
                    startingPrice: true,
                    userId: true,
                    approvalStatus: true,
                    category: true,
                    status: true,
                    featured: true
                }
            });
            return res.json({
                allItems: items,
            });
        }
        catch (error) {
            console.error("Error fetching items:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
    if (category && !search) {
        const items = yield prismaClient_1.prisma.auctionItems.findMany({
            where: {
                category: category.toUpperCase(),
            },
            select: {
                id: true,
                name: true,
                description: true,
                photo: true,
                deadline: true,
                startingPrice: true,
                userId: true,
                approvalStatus: true,
                category: true,
                status: true,
                featured: true
            }
        });
        return res.json({
            allItems: items,
        });
    }
    if (search && category) {
        const items = yield prismaClient_1.prisma.auctionItems.findMany({
            where: {
                category: category.toUpperCase(),
                name: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            select: {
                id: true,
                name: true,
                description: true,
                photo: true,
                deadline: true,
                startingPrice: true,
                userId: true,
                approvalStatus: true,
                category: true,
                status: true,
                featured: true
            }
        });
        return res.json({
            allItems: items,
        });
    }
});
exports.allItems = allItems;
const getItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const item = yield prismaClient_1.prisma.auctionItems.findFirst({
            where: {
                id: Number(id)
            },
            select: {
                id: true,
                startingPrice: true,
                name: true,
                description: true,
                deadline: true,
                photo: true,
                userId: true,
                status: true,
                user: {
                    select: {
                        name: true,
                        photo: true
                    }
                }
            }
        });
        return res.json({
            item
        });
    }
    catch (error) {
        console.error("Error fetching item:", error);
        return res.status(500).json({ error: "Error fetching item" });
    }
});
exports.getItem = getItem;
const deleteItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    yield prismaClient_1.prisma.auctionItems.delete({
        where: {
            id: Number(id),
        },
    });
    return res.json({
        status: "Item successfully deleted",
    });
});
exports.deleteItem = deleteItem;
const getFeaturedItems = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const featuredItems = yield prismaClient_1.prisma.auctionItems.findMany({
            where: {
                featured: true,
            },
        });
        return res.json({
            featuredItems,
        });
    }
    catch (err) {
        return res.status(500).json({ error: "failed to get featured items" });
    }
});
exports.getFeaturedItems = getFeaturedItems;
const contactSeller = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { itemId, buyerId, message } = req.body;
    try {
        const item = yield prismaClient_1.prisma.auctionItems.findUnique({
            where: { id: Number(itemId) },
            include: { user: true }
        });
        if (!item) {
            return res.status(404).json({ error: "Item not found" });
        }
        const buyer = yield prismaClient_1.prisma.user.findUnique({
            where: { id: Number(buyerId) }
        });
        if (!buyer) {
            return res.status(404).json({ error: "Buyer not found" });
        }
        yield (0, mailer_1.sendEmail)({
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
    }
    catch (error) {
        console.error("Error contacting seller:", error);
        return res.status(500).json({ error: "Failed to send contact request" });
    }
});
exports.contactSeller = contactSeller;
