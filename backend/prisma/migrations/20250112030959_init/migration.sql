/*
  Warnings:

  - Added the required column `status` to the `AuctionItems` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'SOLD', 'UNSOLD');

-- AlterTable
ALTER TABLE "AuctionItems" ADD COLUMN     "status" "Status" NOT NULL;
