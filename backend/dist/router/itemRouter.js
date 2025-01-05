"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemRouter = void 0;
const express_1 = __importDefault(require("express"));
const cloudinaryController_1 = require("../controller/cloudinaryController");
const itemController_1 = require("../controller/itemController");
exports.itemRouter = (0, express_1.default)();
const upload = (0, cloudinaryController_1.cloudinarySetup)();
exports.itemRouter.post("/additem", upload.single("photo"), itemController_1.addItem);
exports.itemRouter.get("/allItems", itemController_1.allItems);
exports.itemRouter.get("/:id", itemController_1.getItem);
exports.itemRouter.delete("/:id", itemController_1.deleteItem);
