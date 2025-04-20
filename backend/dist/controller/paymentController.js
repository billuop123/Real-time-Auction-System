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
exports.khaltiCallback = exports.createPayment = void 0;
const axios_1 = __importDefault(require("axios"));
const prismaClient_1 = require("../prismaClient");
const createPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount, products, auctionId } = JSON.parse(JSON.stringify(req.body));
    const formData = {
        return_url: `http://localhost:5173/${auctionId}`,
        website_url: "http://localhost:5173",
        amount: amount * 100,
        purchase_order_id: auctionId,
        purchase_order_name: products[0].product,
    };
    callKhalti(formData, req, res);
});
exports.createPayment = createPayment;
const callKhalti = (formData, req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const headers = {
        Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
        "Content-Type": "application/json",
    };
    try {
        const response = yield axios_1.default.post("https://a.khalti.com/api/v2/epayment/initiate/", formData, { headers });
        yield prismaClient_1.prisma.payment.create({
            data: {
                pidx: response.data.pidx,
                auctionId: String(formData.purchase_order_id),
            },
        });
        res.json({
            message: "Khalti success",
            payment_method: "khalti",
            data: response.data,
        });
    }
    catch (error) {
        console.error("Khalti Payment Error:", error);
        res.status(500).json({ message: "Error processing payment", error });
    }
});
const khaltiCallback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { pidx } = req.query;
    const headers = {
        Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
        "Content-Type": "application/json",
    };
    try {
        const response = yield axios_1.default.post("https://a.khalti.com/api/v2/epayment/lookup/", { pidx }, { headers });
        const paymentStatus = response.data.status;
        if (paymentStatus === "Completed") {
            // ✅ Fetch auctionId from the database using `pidx`
            const paymentRecord = yield prismaClient_1.prisma.payment.findUnique({
                where: { pidx },
            });
            if (!paymentRecord) {
                return res.status(400).json({ message: "No matching payment found" });
            }
            yield prismaClient_1.prisma.auctionItems.update({
                where: {
                    id: Number(paymentRecord.auctionId),
                },
                data: {
                    status: "SOLD",
                },
            });
            return res.json({
                message: "Payment successful",
                payment_status: "Completed",
                transaction_data: response.data,
            });
        }
        else {
            return res.json({
                message: "Payment not completed",
                payment_status: paymentStatus,
                transaction_data: response.data,
            });
        }
    }
    catch (error) {
        console.error("Khalti Lookup Error:", error);
        return res.status(500).json({ message: "Error verifying payment", error });
    }
});
exports.khaltiCallback = khaltiCallback;
