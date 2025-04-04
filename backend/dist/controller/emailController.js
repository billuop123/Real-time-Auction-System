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
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmail = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    let subject = "";
    let html = "";
    switch (options.emailType) {
        case "CONTACT":
            subject = `New Contact Request for ${options.itemName}`;
            html = `
        <h2>New Contact Request</h2>
        <p>You have received a new contact request regarding your item: ${options.itemName}</p>
        <p><strong>From:</strong> ${options.buyerName} (${options.buyerEmail})</p>
        <p><strong>Message:</strong></p>
        <p>${options.message}</p>
        <p>Please respond to this email to contact the buyer.</p>
      `;
            break;
        // Add other email types here
        default:
            throw new Error("Invalid email type");
    }
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: options.email,
        subject,
        html,
    };
    yield transporter.sendMail(mailOptions);
});
exports.sendEmail = sendEmail;
