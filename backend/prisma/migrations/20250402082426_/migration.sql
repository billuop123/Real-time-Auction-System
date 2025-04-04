/*
  Warnings:

  - The `approvalStatus` column on the `AuctionItems` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "AuctionItems" DROP COLUMN "approvalStatus",
ADD COLUMN     "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING';
