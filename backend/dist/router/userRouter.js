"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controller/authController");
const cloudinaryController_1 = require("../controller/cloudinaryController");
const userController_1 = require("../controller/userController");
exports.userRouter = (0, express_1.default)();
const upload = (0, cloudinaryController_1.cloudinarySetup)();
exports.userRouter.post("/signup", upload.single("file"), authController_1.signup);
exports.userRouter.post("/login", authController_1.login);
exports.userRouter.post("/loggedin", authController_1.loggedIn);
exports.userRouter.post("/getuserinfo", userController_1.getUserInfo);
exports.userRouter.post("/userProfile", userController_1.userProfile);
exports.userRouter.post("/updateProfilePicture", upload.single("profilePicture"), userController_1.updateProfilePicture);
exports.userRouter.post("/user-items", userController_1.userItem);
