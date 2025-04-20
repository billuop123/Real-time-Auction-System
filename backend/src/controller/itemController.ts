import { sendEmail } from "../mailer";
import { prisma } from "../prismaClient";

export const addItem = async (req: any, res: any) => {
  let {
    name,
    description,
    photo,
    deadline,
    startingPrice,
    userId,
    category,
  } = req.body;
  if(!category){
    category="OTHERS";
  }
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
    const allItems = await prisma.auctionItems.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        photo: true,
        deadline: true,
        startingPrice: true,
        userId: true,
        approvalStatus: true,
        category: true,
        status: true,
        featured: true
      }
    });

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
        select: {
          id: true,
          name: true,
          description: true,
          photo: true,
          deadline: true,
          startingPrice: true,
          userId: true,
          approvalStatus: true,
          category: true,
          status: true,
          featured: true
        }
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
      select: {
        id: true,
        name: true,
        description: true,
        photo: true,
        deadline: true,
        startingPrice: true,
        userId: true,
        approvalStatus: true,
        category: true,
        status: true,
        featured: true
      }
    });
    return res.json({
      allItems: items,
    });
  }
  if (search && category) {
    const items = await prisma.auctionItems.findMany({
      where: {
        category: category.toUpperCase(),
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        photo: true,
        deadline: true,
        startingPrice: true,
        userId: true,
        approvalStatus: true,
        category: true,
        status: true,
        featured: true
      }
    });
    return res.json({
      allItems: items,
    });
  }
};
export const getItem = async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const item = await prisma.auctionItems.findFirst({
      where: {
        id: Number(id)
      },
      select: {
        id: true,
        startingPrice: true,
        name: true,
        description: true,
        deadline: true,
        photo: true,
        userId: true,
        status: true,
        user: {
          select: {
            name: true,
            photo: true
          }
        }
      }
    });
    return res.json({
      item
    });
  } catch (error) {
    console.error("Error fetching item:", error);
    return res.status(500).json({ error: "Error fetching item" });
  }
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
export const getFeaturedItems = async (req: any, res: any) => {
  try{
    const featuredItems = await prisma.auctionItems.findMany({
      where: {
        featured: true,
      },
    });
    return res.json({
      featuredItems,
    });
  } catch (err) {
 return res.status(500).json({ error: "failed to get featured items" });
 }
};
export const contactSeller=async (req: any, res: any) => {
  const { itemId, buyerId, message } = req.body;
  
  try {
 
    const item = await prisma.auctionItems.findUnique({
      where: { id: Number(itemId) },
      include: { user: true }
    });

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    const buyer = await prisma.user.findUnique({
      where: { id: Number(buyerId) }
    });

    if (!buyer) {
      return res.status(404).json({ error: "Buyer not found" });
    }

    await sendEmail({
      email: item.user.email,
      emailType: "CONTACT",
      userId: item.userId.toString(),
      buyerName: buyer.name,
      buyerEmail: buyer.email,
      itemName: item.name,
      message: message
    });

    return res.json({
      message: "Contact request sent successfully"
    });
  } catch (error: any) {
    console.error("Error contacting seller:", error);
    return res.status(500).json({ error: "Failed to send contact request" });
  }
}