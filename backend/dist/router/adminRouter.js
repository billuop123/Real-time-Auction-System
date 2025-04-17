"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../controller/adminController");
const adminmiddleware_1 = require("../middlewares/adminmiddleware");
exports.adminRouter = (0, express_1.default)();
exports.adminRouter.get("/users", adminmiddleware_1.adminMiddleware, adminController_1.getUsers);
exports.adminRouter.delete("/users/:userId", adminmiddleware_1.adminMiddleware, adminController_1.deleteUser);
exports.adminRouter.get("/unapproveditems", adminController_1.getUnapprovedItems);
exports.adminRouter.post("/items/:itemId/approve", adminmiddleware_1.adminMiddleware, adminController_1.approveItem);
exports.adminRouter.post("/disapprove/:itemId", adminmiddleware_1.adminMiddleware, adminController_1.disapproveItem);
exports.adminRouter.post("/featured/:itemId", adminmiddleware_1.adminMiddleware, adminController_1.featuredItem);
exports.adminRouter.get("/items/:itemId", adminController_1.getItemDetails);
exports.adminRouter.post("/items/:itemId/resubmit", adminmiddleware_1.adminMiddleware, adminController_1.resubmitItem);
