import { JWT_SECRET } from "../config";
import { prisma } from "../prismaClient";
import bcrypt from "bcryptjs";
import z from "zod";
import jwt from "jsonwebtoken";
import { sendEmail } from "../mailer";
const userSchema = z.object({
  name: z.string(),
  password: z.string().min(6),
  email: z.string().email(),
});

export const signup = async (req: any, res: any) => {
  const { email, name, password } = req.body;
  const validationResult = userSchema.safeParse({ name, password, email });

  if (!validationResult.success) {
    return res.status(400).json({
      message: "Inputs are not in the required format",
    });
  }

  const uploadedFile = req.file;
  const savedPassword = await bcrypt.hash(password, 15);

  try {
    const newUser = await prisma.$transaction(async (prisma:any) => {
      const existingUser = await prisma.user.findFirst({
        where: { email },
      });
      if (existingUser) {
        throw new Error("User already exists");
      }
    
      const signedupUser= await prisma.user.create({
        data: {
          name,
          email,
          password: savedPassword,
          photo: uploadedFile?.path,
        },
      });
    
      return signedupUser;
    });
    await sendEmail({email,emailType:"VERIFY",userId:newUser.id})
    res.status(201).json({
      status: "success",
      newUser,
    });
  } catch (error: any) {
    if (error.message === "User already exists") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: `Internal Server Error${error.message}` });
  }
};
export const login = async (req: any, res: any) => {
  const { email, password } = req.body;
  const emailUser = await prisma.user.findFirst({
    where: {
      email,
    },
  });
  if (!emailUser) {
    return res.status(400).json({
      message: "There is no such user",
    });
  }
  if(emailUser.password){
    const result = await bcrypt.compare(password, emailUser.password);
    if (!result) {
      return res.status(400).json({
        message: "Email and Password donot match",
      });
    }
  }


  

  const token = jwt.sign({ userId: emailUser.id }, JWT_SECRET, {
    expiresIn: "3d",
  });

  return res.status(200).json({
    message: "Successfully logged in",
    token,
  });
};
export const loggedIn = async (req: any, res: any) => {
  const { jwtR } = req.body;
  try {
    jwt.verify(jwtR, JWT_SECRET);
    return res.status(200).json({
      status: true,
    });
  } catch (e) {
    return res.status(200).json({
      status: false,
    });
  }
};
export const userSigninGoogle=async(req:any,res:any)=>{
  const {photo,name,email}=req.body
  console.log("recieved")
  try{
    const {id}=await prisma.user.create({
      data:{
        photo,
        name,
        email
      }
    })
    const token = jwt.sign({ userId: id }, JWT_SECRET, {
      expiresIn: "3d",
    });
  
    return res.json({
      token
    })
  }catch(err:any){
    console.log(err)
    return res.json({
      error:`Failed to signin with google${err.message}`
    })
  }

}
export const verifyEmail=async(req:any,res:any)=>{
  const {token}=req.body
  console.log(token)
  try{
    const user=await prisma.user.findFirst({
      where:{
        verifiedToken:token
      }
    })
    if(!user){
     return res.status(400).json({
      error:"Invalid token"
     })
    }
    if(Number(user.verifiedTokenExpiry) < Number(Date.now())){
      return res.status(400).json({
        error:"Token expired"
      })
    }
    await prisma.user.update({
      where:{id:user.id},
      data:{
        verifiedToken:null,
        verifiedTokenExpiry:null,
        isVerified:true
      }
    })
    return res.json({
      message:"Email verified successfully"
    })
  }catch(err:any){
   
    return res.status(500).json({
      error:`Failed to verify email${err.message}`
    })
  }
}
export const resendVerificationEmail=async(req:any,res:any)=>{
  const {userId}=req.body
  try{
    const user=await prisma.user.findFirst({
      where:{
        id:Number(userId)
      }
    })
    if(!user){
      return res.status(400).json({
        error:"User not found"
      })
    }
    await sendEmail({email:user.email,emailType:"VERIFY",userId:user.id.toString()})
    return res.json({
      message:"Verification email sent successfully"
    })
  }
  catch(err:any){
    return res.status(500).json({
      error:`Failed to resend verification email${err.message}`
    })
  }
}
export const isVerified=async(req:any,res:any)=>{
  const {userId}=req.body
  try{
    const user=await prisma.user.findFirst({
      where:{id:Number(userId)}
    })
    return res.json({
      isVerified:user?.isVerified
    })
  }catch(err:any){
    return res.status(500).json({
      error:`Failed to check if user is verified${err.message}`
    })
  }
}
export const adminSignin = async (req: any, res: any) => {
  const { email, password } = req.body;
  
  try {
    const admin = await prisma.user.findFirst({
      where: {
        email,
        role: "ADMIN"
      }
    });

    if (!admin) {
      return res.status(401).json({
        message: "Invalid admin credentials"
      });
    }

    if (!admin.password) {
      return res.status(401).json({
        message: "Invalid admin credentials"
      });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid admin credentials"
      });
    }

    const token = jwt.sign({ userId: admin.id, role: "ADMIN" }, JWT_SECRET, {
      expiresIn: "3d",
    });

    return res.status(200).json({
      message: "Successfully logged in as admin",
      token,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      message: `Internal Server Error: ${error.message}`
    });
  }
};
export const resetPasswordEmail=async(req:any,res:any)=>{
  const {email}=req.body
  try{
    const user=await prisma.user.findFirst({
      where:{email}
    })
    if(!user){
      return res.status(400).json({
        error:"User not found"
      })
    }
    await sendEmail({email:user.email,emailType:"RESET",userId:user.id.toString()})
    return res.json({
      message:"Reset password email sent successfully"
    })
  }
  catch(err:any){
    return res.status(500).json({
      error:`Failed to reset password${err.message}`
    })
  }

}
export const resetPassword=async(req:any,res:any)=>{
  const {token,newPassword}=req.body
  console.log(token,newPassword)
  try{
    const user=await prisma.user.findFirst({
      where:{resetPasswordToken:token}
    })
    console.log(user)
    if(!user){
      return res.status(400).json({
        error:"User not found"
      })
    }
    if(Number(user.resetPasswordTokenExpiry) < Number(Date.now())){
      return res.status(400).json({
        error:"Token expired"
      })
    }
    await prisma.user.update({
      where:{id:user.id},
      data:{
        resetPasswordToken:null,
        resetPasswordTokenExpiry:null,
        password:await bcrypt.hash(newPassword,15)
      }
    })
    return res.json({
      message:"Password reset successfully"
    })
  } 
  catch(err:any){
    return res.status(500).json({
      error:`Failed to reset password${err.message}`
    })
  }
}