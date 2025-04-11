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
exports.userRouter = void 0;
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controller/authController");
const cloudinaryController_1 = require("../controller/cloudinaryController");
const userController_1 = require("../controller/userController");
const prismaClient_1 = require("../prismaClient");
exports.userRouter = (0, express_1.default)();
const upload = (0, cloudinaryController_1.cloudinarySetup)();
exports.userRouter.post("/signup", upload.single("file"), authController_1.signup);
exports.userRouter.post("/login", authController_1.login);
exports.userRouter.post("/loggedin", authController_1.loggedIn);
exports.userRouter.post("/getuserinfo", userController_1.getUserInfo);
exports.userRouter.post("/userProfile", userController_1.userProfile);
exports.userRouter.post("/verifyemail", authController_1.verifyEmail);
exports.userRouter.post("/resendverificationemail", authController_1.resendVerificationEmail);
exports.userRouter.post("/isVerified", authController_1.isVerified);
exports.userRouter.post("/admin/signin", authController_1.adminSignin);
exports.userRouter.post("/updateProfilePicture", upload.single("profilePicture"), userController_1.updateProfilePicture);
exports.userRouter.post("/user-items", userController_1.userItem);
exports.userRouter.post("/googlesignin", authController_1.userSigninGoogle);
exports.userRouter.post("/reset-passwordemail", authController_1.resetPasswordEmail);
exports.userRouter.post("/reset-password", authController_1.resetPassword);
exports.userRouter.get("/items/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const items = yield prismaClient_1.prisma.auctionItems.findMany({
            where: {
                userId: Number(userId)
            },
            select: {
                id: true,
                name: true,
                description: true,
                photo: true,
                startingPrice: true,
                deadline: true,
                approvalStatus: true,
                status: true
            },
            orderBy: {
                id: 'desc'
            }
        });
        return res.json({ items });
    }
    catch (error) {
        console.error("Error fetching user items:", error);
        return res.status(500).json({ error: "Error fetching user items" });
    }
}));
