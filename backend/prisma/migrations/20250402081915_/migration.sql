/*
  Warnings:

  - You are about to drop the column `isApproved` on the `AuctionItems` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('APPROVED', 'DISAPPROVED', 'PENDING');

-- AlterTable
ALTER TABLE "AuctionItems" DROP COLUMN "isApproved",
ADD COLUMN     "approvalStatus" BOOLEAN NOT NULL DEFAULT false;
