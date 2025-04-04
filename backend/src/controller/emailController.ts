import nodemailer from "nodemailer";

interface EmailOptions {
  email: string;
  emailType: string;
  userId: string;
  buyerName?: string;
  buyerEmail?: string;
  itemName?: string;
  message?: string;
}

export const sendEmail = async (options: EmailOptions) => {
  const transporter = nodemailer.createTransport({
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

  await transporter.sendMail(mailOptions);
}; 