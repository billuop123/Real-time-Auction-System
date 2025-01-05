import { JWT_SECRET } from "../config";
import { prisma } from "../prismaClient";
import bcrypt from "bcryptjs";
import z from "zod";
import jwt from "jsonwebtoken";
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
    const newUser = await prisma.$transaction(async (prisma) => {
      const existingUser = await prisma.user.findFirst({
        where: { email },
      });
      if (existingUser) {
        throw new Error("User already exists");
      }
      return await prisma.user.create({
        data: {
          name,
          email,
          password: savedPassword,
          photo: uploadedFile?.path,
        },
      });
    });

    res.status(201).json({
      status: "success",
      newUser,
    });
  } catch (error: any) {
    if (error.message === "User already exists") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal Server Error" });
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
  const result = await bcrypt.compare(password, emailUser.password);
  console.log(result);
  if (!result) {
    return res.status(400).json({
      message: "Email and Password donot match",
    });
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
