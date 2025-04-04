
import express from "express";
import { isVerified, loggedIn, login, resendVerificationEmail, signup, userSigninGoogle, verifyEmail } from "../controller/authController";
import { cloudinarySetup } from "../controller/cloudinaryController";
import {
  getUserInfo,
  updateProfilePicture,
  userItem,
  userProfile,
} from "../controller/userController";
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
userRouter.post(
  "/updateProfilePicture",
  upload.single("profilePicture"),  
  updateProfilePicture
);
userRouter.post("/user-items", userItem);
userRouter.post("/googlesignin",userSigninGoogle)
