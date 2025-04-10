import express from "express";
import { isVerified, loggedIn, login, resendVerificationEmail, signup, userSigninGoogle, verifyEmail, adminSignin, resetPassword, resetPasswordEmail } from "../controller/authController";
import { cloudinarySetup } from "../controller/cloudinaryController";
import {
  getUserInfo,
  updateProfilePicture,
  userItem,
  userProfile,
} from "../controller/userController";
import { prisma } from "../prismaClient";

export const userRouter = express();
const upload = cloudinarySetup();
userRouter.post("/signup", upload.single("file"), signup);
userRouter.post("/login", login);
userRouter.post("/loggedin", loggedIn);
userRouter.post("/getuserinfo", getUserInfo);
userRouter.post("/userProfile", userProfile);
userRouter.post("/verifyemail",verifyEmail)
userRouter.post("/resendverificationemail",resendVerificationEmail)
userRouter.post("/isVerified",isVerified)
userRouter.post("/admin/signin", adminSignin)
userRouter.post(
  "/updateProfilePicture",
  upload.single("profilePicture"),  
  updateProfilePicture
);
userRouter.post("/user-items", userItem);
userRouter.post("/googlesignin",userSigninGoogle)
userRouter.post("/reset-passwordemail",resetPasswordEmail)
userRouter.post("/reset-password",resetPassword)
// Get user's items
userRouter.get("/items/:userId", async (req: any, res: any) => {
  const { userId } = req.params;
  try {
    const items = await prisma.auctionItems.findMany({
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
  } catch (error) {
    console.error("Error fetching user items:", error);
    return res.status(500).json({ error: "Error fetching user items" });
  }
});
