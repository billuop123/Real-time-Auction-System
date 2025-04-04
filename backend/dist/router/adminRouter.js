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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = __importDefault(require("express"));
const prismaClient_1 = require("../prismaClient");
exports.adminRouter = (0, express_1.default)();
exports.adminRouter.get("/unapproveditems", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
}));
exports.adminRouter.get("/items/:itemId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        return res.json({
            error: `Failed to approve item ${err.message}`
        });
    }
}));
exports.adminRouter.post("/disapprove/:itemId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
}));
exports.adminRouter.post("/featured/:itemId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
            error: `Failed to approve item ${err.message}`
        });
    }
}));
