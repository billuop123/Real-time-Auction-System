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
exports.khaltiRouter = void 0;
const axios_1 = __importDefault(require("axios"));
const express_1 = __importDefault(require("express"));
const react_router_dom_1 = require("react-router-dom");
exports.khaltiRouter = (0, express_1.default)();
exports.khaltiRouter.post("/create", (req, res) => {
    //   const { amount, purchase_order_id } = req.body;
    //   console.log(purchase_order_id, amount);
    const { amount, products } = JSON.parse(JSON.stringify(req.body));
    const formData = {
        return_url: "http://localhost:5173",
        website_url: "http://localhost:5173",
        amount: amount * 100,
        purchase_order_id: 2,
        purchase_order_name: products[0].product,
    };
    callKhalti(formData, req, res);
});
const callKhalti = (formData, req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const headers = {
        Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
        "Content-Type": "application/json",
    };
    const response = yield axios_1.default.post("https://a.khalti.com/api/v2/epayment/initiate/", formData, {
        headers,
    });
    res.json({
        message: "khalti success",
        payment_method: "khalti",
        data: response.data,
    });
});
exports.khaltiRouter.get("/callback", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { txnId, pidx, amount, purchase_order_id, transaction_id, message } = req.query;
    const headers = {
        Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
        "Content-Type": "application/json",
    };
    (0, react_router_dom_1.redirect)("/");
    const response = yield axios_1.default.post("https://a.khalti.com/api/v2/epayment/lookup/", { pidx }, { headers });
    res.json({
        response: response.data,
    });
}));
