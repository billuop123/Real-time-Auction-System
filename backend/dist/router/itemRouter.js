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
exports.itemRouter = void 0;
const express_1 = __importDefault(require("express"));
const cloudinaryController_1 = require("../controller/cloudinaryController");
const itemController_1 = require("../controller/itemController");
const mailer_1 = require("../mailer");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.itemRouter = (0, express_1.default)();
const upload = (0, cloudinaryController_1.cloudinarySetup)();
exports.itemRouter.post("/additem", upload.single("photo"), itemController_1.addItem);
exports.itemRouter.get("/allItems", itemController_1.allItems);
exports.itemRouter.get("/featured", itemController_1.getFeaturedItems);
exports.itemRouter.get("/:id", itemController_1.getItem);
exports.itemRouter.delete("/:id", itemController_1.deleteItem);
// Contact seller endpoint
exports.itemRouter.post("/contact-seller", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { itemId, buyerId, message } = req.body;
    try {
        // Get item and seller details
        const item = yield prisma.auctionItems.findUnique({
            where: { id: Number(itemId) },
            include: { user: true }
        });
        if (!item) {
            return res.status(404).json({ error: "Item not found" });
        }
        // Get buyer details
        const buyer = yield prisma.user.findUnique({
            where: { id: Number(buyerId) }
        });
        if (!buyer) {
            return res.status(404).json({ error: "Buyer not found" });
        }
        // Send email to seller
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
}));
