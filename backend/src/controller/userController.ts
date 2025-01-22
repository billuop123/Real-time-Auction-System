import { prisma } from "../prismaClient";
export const getUserInfo = async (req: any, res: any) => {
  const { userId } = req.body;
  const userInfo = await prisma.user.findFirst({
    where: {
      id: userId,
    },
    select: {
      name: true,
      photo: true,
    },
  });

  return res.json({
    userInfo,
  });
};
export const userProfile = async (req: any, res: any) => {
  const { userId } = req.body;
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
  });

  return res.json({
    user,
  });
};
export const updateProfilePicture = async (req: any, res: any) => {
  const { userId } = req.body;
  const uploadedFile = req.file;
  const path = uploadedFile?.path;
  const updatedUser = await prisma.user.update({
    where: {
      id: Number(userId),
    },
    data: {
      photo: path,
    },
  });
  return res.json({
    photo: updatedUser.photo,
  });
};
export const userItem = async (req: any, res: any) => {
  const { userId } = req.body;
  const items = await prisma.auctionItems.findMany({
    where: {
      userId,
    },
  });
  return res.json({
    items,
  });
};
