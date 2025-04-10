import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { prisma } from "./prismaClient";

dotenv.config(); // Load environment variables

interface EmailOptions {
  email: string;
  emailType: "VERIFY" | "RESET" | "CONTACT";
  userId: string;
  buyerName?: string;
  buyerEmail?: string;
  itemName?: string;
  message?: string;
}

export const sendEmail = async (options: EmailOptions) => {
  try {
    console.log("📨 Sending email to:", options.email);
    const hashedToken = await bcrypt.hash(options.userId.toString(), 10);

    if (options.emailType === "VERIFY") {
      // Update user record based on email type
      const updateData: any = {
        verifiedToken: hashedToken,
        verifiedTokenExpiry: new Date(Date.now() + 36000000), 
      };


      await prisma.user.update({
        where: { id: Number(options.userId) },
        data: updateData,
      });
    }
    if(options.emailType==="RESET"){
      const updateData: any = {
        resetPasswordToken: hashedToken,
        resetPasswordTokenExpiry: new Date(Date.now() + 36000000), 
      };
      await prisma.user.update({
        where: { id: Number(options.userId) },
        data: updateData,
      });
    }
    // Configure Gmail SMTP Transport
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "465"),
      secure: true, // Use SSL
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email Content
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

    // Mail Options
    const mailOptions = {
      from: `"Auction system" <${process.env.SMTP_USER}>`,
      to: options.email,
      subject,
      html,
    };

    // Send Email
    const mailResponse = await transport.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", mailResponse.messageId);
    return mailResponse;
  } catch (error: any) {
    console.error("❌ Error sending email:", error.message);
    throw new Error(error.message);
  }
};