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
exports.deleteItem = exports.getItem = exports.allItems = exports.addItem = void 0;
const prismaClient_1 = require("../prismaClient");
const addItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, photo, deadline, startingPrice, userId, category, } = req.body;
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
        const allItems = yield prismaClient_1.prisma.auctionItems.findMany({});
        console.log(allItems);
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
        });
        return res.json({
            allItems: items,
        });
    }
    if (search && category) {
        console.log(search, category.toUpperCase());
        const items = yield prismaClient_1.prisma.auctionItems.findMany({
            where: {
                category: category.toUpperCase(),
                name: {
                    contains: search,
                    mode: "insensitive",
                },
            },
        });
        return res.json({
            allItems: items,
        });
    }
});
exports.allItems = allItems;
const getItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const item = yield prismaClient_1.prisma.auctionItems.findFirst({
        where: {
            id: Number(id),
        },
        select: {
            id: true,
            startingPrice: true,
            name: true,
            description: true,
            deadline: true,
            photo: true,
            userId: true,
            user: {
                select: {
                    name: true,
                    photo: true,
                },
            },
        },
    });
    console.log(item);
    return res.json({
        item,
    });
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
