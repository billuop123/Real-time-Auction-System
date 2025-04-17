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
exports.adminMiddleware = void 0;
const config_1 = require("../config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const adminMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const jwtT = req.headers.authorization;
    if (!jsonwebtoken_1.default) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    console.log(jwtT);
    try {
        const decoded = jsonwebtoken_1.default.verify(jwtT, config_1.JWT_SECRET);
        console.log("-------");
        //@ts-ignore
        console.log(decoded.role);
        //@ts-ignore
        if (decoded.role != "ADMIN") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({ message: "Unauthorized",
            error: `${error.message}`
        });
    }
});
exports.adminMiddleware = adminMiddleware;
