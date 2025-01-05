-- CreateEnum
CREATE TYPE "Category" AS ENUM ('ELECTRONICS', 'VEHICLES', 'FASHION', 'ART', 'SPORTS', 'BOOKS', 'TOYS', 'TOOLS', 'OTHERS');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "photo" TEXT NOT NULL DEFAULT 'https://scontent.fpkr1-1.fna.fbcdn.net/v/t1.30497-1/453178253_471506465671661_2781666950760530985_n.png?stp=dst-png_s200x200&_nc_cat=1&ccb=1-7&_nc_sid=136b72&_nc_ohc=PChT7-OSFhoQ7kNvgHZxP9w&_nc_oc=AdgyGq5XIJO2WSdLg4aUhC_uAXnNiXFKfN3dvRozJLAWoJtcK99CqxMX5hepMqpljFo&_nc_zt=24&_nc_ht=scontent.fpkr1-1.fna&_nc_gid=AQXhB9P6oP4STz7pxSUCEZu&oh=00_AYAilRkKDIVZO8qaRCXN9iLhGYOZdcDQMPz5p0NdZLnGhQ&oe=67938D7A',
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuctionItems" (
    "id" SERIAL NOT NULL,
    "startingPrice" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "photo" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "category" "Category" NOT NULL,

    CONSTRAINT "AuctionItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bids" (
    "id" SERIAL NOT NULL,
    "price" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "auctionId" INTEGER NOT NULL,

    CONSTRAINT "Bids_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "auctionId" INTEGER NOT NULL,
    "seen" BOOLEAN NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "AuctionItems" ADD CONSTRAINT "AuctionItems_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bids" ADD CONSTRAINT "Bids_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "AuctionItems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bids" ADD CONSTRAINT "Bids_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "AuctionItems"("id") ON DELETE CASCADE ON UPDATE CASCADE;
