-- AlterTable
ALTER TABLE "User" ADD COLUMN     "verifiedToken" TEXT,
ADD COLUMN     "verifiedTokenExpiry" TIMESTAMP(3);
