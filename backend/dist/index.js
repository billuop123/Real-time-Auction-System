"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userRouter_1 = require("./router/userRouter");
const cors_1 = __importDefault(require("cors"));
const ws_1 = __importStar(require("ws"));
const itemRouter_1 = require("./router/itemRouter");
const bidRouter_1 = require("./router/bidRouter");
const notificationRouter_1 = require("./router/notificationRouter");
const khaltiRouter_1 = require("./router/khaltiRouter");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
}));
app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src https: http:; script-src https: http:; connect-src https: http:;");
    next();
});
app.use("/api/v1/user", userRouter_1.userRouter);
app.use("/api/v1/item", itemRouter_1.itemRouter);
app.use("/api/v1/bid", bidRouter_1.bidRouter);
app.use("/api/v1/notification", notificationRouter_1.notificationRouter);
app.use("/api/v1/khalti", khaltiRouter_1.khaltiRouter);
const port = process.env.PORT;
const server = app.listen(port, () => {
    console.log(`Server is listening in port ${port}`);
});
const wss = new ws_1.WebSocketServer({ server });
wss.on("connection", (ws) => {
    ws.on("error", console.error);
    ws.on("message", (data, isBinary) => {
        wss.clients.forEach((client) => {
            if (client.readyState === ws_1.default.OPEN) {
                client.send(data, { binary: isBinary });
            }
        });
    });
});
