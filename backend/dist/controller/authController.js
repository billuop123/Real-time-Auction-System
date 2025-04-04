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
exports.isVerified = exports.resendVerificationEmail = exports.verifyEmail = exports.userSigninGoogle = exports.loggedIn = exports.login = exports.signup = void 0;
const config_1 = require("../config");
const prismaClient_1 = require("../prismaClient");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const zod_1 = __importDefault(require("zod"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mailer_1 = require("../mailer");
const userSchema = zod_1.default.object({
    name: zod_1.default.string(),
    password: zod_1.default.string().min(6),
    email: zod_1.default.string().email(),
});
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, name, password } = req.body;
    const validationResult = userSchema.safeParse({ name, password, email });
    if (!validationResult.success) {
        return res.status(400).json({
            message: "Inputs are not in the required format",
        });
    }
    const uploadedFile = req.file;
    const savedPassword = yield bcryptjs_1.default.hash(password, 15);
    try {
        const newUser = yield prismaClient_1.prisma.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            const existingUser = yield prisma.user.findFirst({
                where: { email },
            });
            if (existingUser) {
                throw new Error("User already exists");
            }
            const signedupUser = yield prisma.user.create({
                data: {
                    name,
                    email,
                    password: savedPassword,
                    photo: uploadedFile === null || uploadedFile === void 0 ? void 0 : uploadedFile.path,
                },
            });
            return signedupUser;
        }));
        yield (0, mailer_1.sendEmail)({ email, emailType: "VERIFY", userId: newUser.id });
        res.status(201).json({
            status: "success",
            newUser,
        });
    }
    catch (error) {
        if (error.message === "User already exists") {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: `Internal Server Error${error.message}` });
    }
});
exports.signup = signup;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const emailUser = yield prismaClient_1.prisma.user.findFirst({
        where: {
            email,
        },
    });
    if (!emailUser) {
        return res.status(400).json({
            message: "There is no such user",
        });
    }
    if (emailUser.password) {
        const result = yield bcryptjs_1.default.compare(password, emailUser.password);
        if (!result) {
            return res.status(400).json({
                message: "Email and Password donot match",
            });
        }
    }
    const token = jsonwebtoken_1.default.sign({ userId: emailUser.id }, config_1.JWT_SECRET, {
        expiresIn: "3d",
    });
    return res.status(200).json({
        message: "Successfully logged in",
        token,
    });
});
exports.login = login;
const loggedIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { jwtR } = req.body;
    try {
        jsonwebtoken_1.default.verify(jwtR, config_1.JWT_SECRET);
        return res.status(200).json({
            status: true,
        });
    }
    catch (e) {
        return res.status(200).json({
            status: false,
        });
    }
});
exports.loggedIn = loggedIn;
const userSigninGoogle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { photo, name, email } = req.body;
    console.log("recieved");
    try {
        const { id } = yield prismaClient_1.prisma.user.create({
            data: {
                photo,
                name,
                email
            }
        });
        const token = jsonwebtoken_1.default.sign({ userId: id }, config_1.JWT_SECRET, {
            expiresIn: "3d",
        });
        return res.json({
            token
        });
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: `Failed to signin with google${err.message}`
        });
    }
});
exports.userSigninGoogle = userSigninGoogle;
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.body;
    try {
        const user = yield prismaClient_1.prisma.user.findFirst({
            where: {
                verifiedToken: token
            }
        });
        if (!user) {
            return res.status(400).json({
                error: "Invalid token"
            });
        }
        if (Number(user.verifiedTokenExpiry) < Number(Date.now())) {
            return res.status(400).json({
                error: "Token expired"
            });
        }
        yield prismaClient_1.prisma.user.update({
            where: { id: user.id },
            data: {
                verifiedToken: null,
                verifiedTokenExpiry: null,
                isVerified: true
            }
        });
        return res.json({
            message: "Email verified successfully"
        });
    }
    catch (err) {
        return res.status(500).json({
            error: `Failed to verify email${err.message}`
        });
    }
});
exports.verifyEmail = verifyEmail;
const resendVerificationEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    try {
        const user = yield prismaClient_1.prisma.user.findFirst({
            where: {
                id: Number(userId)
            }
        });
        if (!user) {
            return res.status(400).json({
                error: "User not found"
            });
        }
        yield (0, mailer_1.sendEmail)({ email: user.email, emailType: "VERIFY", userId: user.id.toString() });
        return res.json({
            message: "Verification email sent successfully"
        });
    }
    catch (err) {
        return res.status(500).json({
            error: `Failed to resend verification email${err.message}`
        });
    }
});
exports.resendVerificationEmail = resendVerificationEmail;
const isVerified = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    try {
        const user = yield prismaClient_1.prisma.user.findFirst({
            where: { id: Number(userId) }
        });
        return res.json({
            isVerified: user === null || user === void 0 ? void 0 : user.isVerified
        });
    }
    catch (err) {
        return res.status(500).json({
            error: `Failed to check if user is verified${err.message}`
        });
    }
});
exports.isVerified = isVerified;
