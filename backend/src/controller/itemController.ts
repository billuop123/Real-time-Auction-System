import { prisma } from "../prismaClient";

export const addItem = async (req: any, res: any) => {
  const {
    name,
    description,
    photo,
    deadline,
    startingPrice,
    userId,
    category,
  } = req.body;

  const uploadedFile = req?.file;
  const photoPath = uploadedFile?.path || "default-placeholder-url";
  const defaultCategories = ["OTHERS"];
  const item = await prisma.auctionItems.create({
    data: {
      name,
      description,
      photo: photoPath,
      deadline,
      startingPrice: Number(startingPrice),
      userId: Number(userId),
      category: category || defaultCategories,
    },
  });
  return res.json({
    item,
  });
};
export const allItems = async (req: any, res: any) => {
  const { search, category } = req.query;
  if (!search && !category) {
    const allItems = await prisma.auctionItems.findMany({});
    console.log(allItems);
    return res.json({
      allItems,
    });
  }
  if (search && !category) {
    try {
      const items = await prisma.auctionItems.findMany({
        where: {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      });

      return res.json({
        allItems: items,
      });
    } catch (error) {
      console.error("Error fetching items:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
  if (category && !search) {
    const items = await prisma.auctionItems.findMany({
      where: {
        category: category.toUpperCase(),
      },
    });
    return res.json({
      allItems: items,
    });
  }
  if (search && category) {
    console.log(search, category.toUpperCase());
    const items = await prisma.auctionItems.findMany({
      where: {
        category: category.toUpperCase(),
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
    });
    return res.json({
      allItems: items,
    });
  }
};
export const getItem = async (req: any, res: any) => {
  const { id } = req.params;
  const item = await prisma.auctionItems.findFirst({
    where: {
      id: Number(id),
    },
    select: {
      id: true,
      startingPrice: true,
      name: true,
      description: true,
      deadline: true,
      photo: true,
      userId: true,
      user: {
        select: {
          name: true,
          photo: true,
        },
      },
    },
  });
  console.log(item);
  return res.json({
    item,
  });
};
export const deleteItem = async (req: any, res: any) => {
  const { id } = req.params;
  await prisma.auctionItems.delete({
    where: {
      id: Number(id),
    },
  });
  return res.json({
    status: "Item successfully deleted",
  });
};
