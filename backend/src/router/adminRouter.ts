import express from "express";
import { prisma } from "../prismaClient";
export const adminRouter = express();

// Get all users
adminRouter.get("/users", async (req: any, res: any) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        photo: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            auctionItems: true,
            bids: true
          }
        }
      }
    });
    return res.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "Error fetching users" });
  }
});

// Get user details with their auctions and bids
adminRouter.get("/users/:userId", async (req: any, res: any) => {
  const { userId } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      include: {
        auctionItems: {
          select: {
            id: true,
            name: true,
            startingPrice: true,
            deadline: true,
            status: true,
            approvalStatus: true
          }
        },
        bids: {
          select: {
            id: true,
            price: true,
            auction: {
              select: {
                id: true,
                name: true,
                status: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ user });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return res.status(500).json({ error: "Error fetching user details" });
  }
});

// Get unapproved items
adminRouter.get("/unapproveditems", async (req: any, res: any) => {
    try {
        const items = await prisma.auctionItems.findMany({
            where: {
                approvalStatus: "PENDING"
            }
        });
        return res.json({
            items
        });
    } catch (e) {
        return res.json({
            Error: "Error fetching items"
        });
    }
});

// Approve item
adminRouter.post("/items/:itemId/approve", async (req: any, res: any) => {
    const { itemId } = req.params;
    try {
        const updatedValue = await prisma.auctionItems.update({
            where: {
                id: Number(itemId)
            },
            data: {
                approvalStatus: "APPROVED"
            }
        });
        return res.json({
            updatedValue
        });
    } catch (err: any) {
        console.error("Error approving item:", err);
        return res.status(500).json({ error: `Failed to approve item: ${err.message}` });
    }
});

// Disapprove item
adminRouter.post("/disapprove/:itemId", async (req: any, res: any) => {
    const { itemId } = req.params;
    try {
        await prisma.auctionItems.update({
            where: { id: Number(itemId) },
            data: { approvalStatus: "DISAPPROVED" },
        });
        return res.json({
            status: "Item successfully disapproved",
        });
    } catch (error) {
        console.error("Error disapproving item:", error);
        return res.status(500).json({ error: "Error disapproving item" });
    }
});

// Toggle featured status
adminRouter.post("/featured/:itemId", async (req: any, res: any) => {
    const { itemId } = req.params;
    const { featured } = req.body;
    try {
        const updatedValue = await prisma.auctionItems.update({
            where: {
                id: Number(itemId)
            },
            data: {
                featured
            }
        });
        return res.json({
            updatedValue
        });
    } catch (err: any) {
        return res.json({
            error: `Failed to update featured status: ${err.message}`
        });
    }
});

// Get item details
adminRouter.get("/items/:itemId", async (req: any, res: any) => {
    const { itemId } = req.params;
    try {
        const item = await prisma.auctionItems.findUnique({
            where: {
                id: Number(itemId)
            },
            select: {
                id: true,
                name: true,
                description: true,
                startingPrice: true,
                deadline: true,
                photo: true,
                status: true,
                approvalStatus: true,
                featured: true,
                user: {
                    select: {
                        name: true,
                        photo: true
                    }
                }
            }
        });
        if (!item) {
            return res.status(404).json({ error: "Item not found" });
        }
        return res.json({ item });
    } catch (err: any) {
        console.error("Error fetching item:", err);
        return res.status(500).json({ error: "Failed to fetch item" });
    }
});