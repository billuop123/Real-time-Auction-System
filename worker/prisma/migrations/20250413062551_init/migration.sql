-- AlterTable
ALTER TABLE "AuctionItems" ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "category" SET DEFAULT 'OTHERS';
