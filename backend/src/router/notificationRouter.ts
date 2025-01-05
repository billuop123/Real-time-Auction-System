import express from "express";
import { prisma } from "../prismaClient";
export const notificationRouter = express();
notificationRouter.post("/new-notification", async (req: any, res: any) => {
  const { auctionId, userId } = req.body;
  const newNotification = await prisma.notification.create({
    data: {
      auctionId: Number(auctionId),
      userId,
      seen: false,
    },
  });
  return res.json({
    status: "success",
  });
});
notificationRouter.get("/:id", async (req: any, res: any) => {
  const { id } = req.params;
  const notifications = await prisma.notification.findMany({
    where: {
      userId: Number(id),
      seen: false,
    },
    select: {
      auction: {
        select: {
          photo: true,
          name: true,
        },
      },
    },
  });
  console.log(notifications);
  return res.json({
    notifications,
  });
});
notificationRouter.put("/clearnotifications", async (req: any, res: any) => {
  const { id } = req.body;

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: id,
      },
    });

    if (notifications.length === 0) {
      return res
        .status(404)
        .json({ message: "No notifications found for the given user." });
    }

    const updatePromises = notifications.map((notification) =>
      prisma.notification.update({
        where: {
          id: notification.id,
        },
        data: {
          seen: true,
        },
      })
    );

    await Promise.all(updatePromises);

    res.status(200).json({
      message: "Notifications marked as seen for the user.",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while updating notifications." });
  }
});
