"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.khaltiRouter = void 0;
const express_1 = __importDefault(require("express"));
const paymentController_1 = require("../controller/paymentController");
exports.khaltiRouter = (0, express_1.default)();
exports.khaltiRouter.post("/create", paymentController_1.createPayment);
exports.khaltiRouter.get("/callback", paymentController_1.khaltiCallback);
