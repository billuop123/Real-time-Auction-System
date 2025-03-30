-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "pidx" TEXT NOT NULL,
    "auctionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_pidx_key" ON "Payment"("pidx");
