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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
const prismaClient_1 = require("./prismaClient");
dotenv_1.default.config(); // Load environment variables
const sendEmail = (options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hashedToken = yield bcryptjs_1.default.hash(options.userId.toString(), 10);
        if (options.emailType === "VERIFY") {
            const updateData = {
                verifiedToken: hashedToken,
                verifiedTokenExpiry: new Date(Date.now() + 36000000),
            };
            yield prismaClient_1.prisma.user.update({
                where: { id: Number(options.userId) },
                data: updateData,
            });
        }
        if (options.emailType === "RESET") {
            const updateData = {
                resetPasswordToken: hashedToken,
                resetPasswordTokenExpiry: new Date(Date.now() + 36000000),
            };
            yield prismaClient_1.prisma.user.update({
                where: { id: Number(options.userId) },
                data: updateData,
            });
        }
        const transport = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || "465"),
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        let subject = "";
        let html = "";
        switch (options.emailType) {
            case "VERIFY":
                subject = "Verify your email";
                html = `
          <p>Click <a href="${process.env.domain}/verifyemail?token=${hashedToken}">
            here
          </a> to verify your email.</p>
        `;
                break;
            case "RESET":
                subject = "Reset your password";
                html = `
          <p>Click <a href="${process.env.domain}/resetpassword?token=${hashedToken}">
            here
          </a> to reset your password.</p>
        `;
                break;
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
        }
        const mailOptions = {
            from: `"Auction system" <${process.env.SMTP_USER}>`,
            to: options.email,
            subject,
            html,
        };
        const mailResponse = yield transport.sendMail(mailOptions);
        return mailResponse;
    }
    catch (error) {
        console.error("❌ Error sending email:", error.message);
        throw new Error(error.message);
    }
});
exports.sendEmail = sendEmail;
