-- CreateTable
CREATE TABLE "Number" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "e164" TEXT NOT NULL,
    "leaseId" INTEGER,

    CONSTRAINT "Number_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lease" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lesseeId" INTEGER NOT NULL,

    CONSTRAINT "Lease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lessee" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wallet" TEXT NOT NULL,

    CONSTRAINT "Lessee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "isRead" BOOLEAN NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL,
    "sentToE164" TEXT NOT NULL,
    "sentFromE164" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "lesseeId" INTEGER NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Number_e164_key" ON "Number"("e164");

-- CreateIndex
CREATE UNIQUE INDEX "Lessee_wallet_key" ON "Lessee"("wallet");

-- AddForeignKey
ALTER TABLE "Number" ADD CONSTRAINT "Number_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "Lease"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lease" ADD CONSTRAINT "Lease_lesseeId_fkey" FOREIGN KEY ("lesseeId") REFERENCES "Lessee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_lesseeId_fkey" FOREIGN KEY ("lesseeId") REFERENCES "Lessee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
