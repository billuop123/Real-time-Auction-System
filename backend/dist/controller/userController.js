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
Object.defineProperty(exports, "__esModule", { value: true });
exports.userItem = exports.updateProfilePicture = exports.userProfile = exports.getUserInfo = void 0;
const prismaClient_1 = require("../prismaClient");
const getUserInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    const userInfo = yield prismaClient_1.prisma.user.findFirst({
        where: {
            id: userId,
        },
        select: {
            name: true,
            photo: true,
        },
    });
    return res.json({
        userInfo,
    });
});
exports.getUserInfo = getUserInfo;
const userProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    const { userId } = req.body;
    const user = yield prismaClient_1.prisma.user.findFirst({
        where: {
            id: userId,
        },
    });
    console.log(user);
    return res.json({
        user,
    });
});
exports.userProfile = userProfile;
const updateProfilePicture = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    const uploadedFile = req.file;
    const path = uploadedFile === null || uploadedFile === void 0 ? void 0 : uploadedFile.path;
    const updatedUser = yield prismaClient_1.prisma.user.update({
        where: {
            id: Number(userId),
        },
        data: {
            photo: path,
        },
    });
    return res.json({
        photo: updatedUser.photo,
    });
});
exports.updateProfilePicture = updateProfilePicture;
const userItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    const items = yield prismaClient_1.prisma.auctionItems.findMany({
        where: {
            userId,
        },
    });
    return res.json({
        items,
    });
});
exports.userItem = userItem;
