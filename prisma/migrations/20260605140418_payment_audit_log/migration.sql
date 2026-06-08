-- CreateTable
CREATE TABLE "PaymentAuditLog" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'paystack',
    "event" TEXT NOT NULL,
    "dedupeKey" TEXT NOT NULL,
    "reference" TEXT,
    "transactionId" INTEGER,
    "orderId" TEXT,
    "rawBody" TEXT NOT NULL,
    "signatureVerified" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'received',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentAuditLog_dedupeKey_key" ON "PaymentAuditLog"("dedupeKey");

-- CreateIndex
CREATE INDEX "PaymentAuditLog_provider_event_idx" ON "PaymentAuditLog"("provider", "event");

-- CreateIndex
CREATE INDEX "PaymentAuditLog_reference_idx" ON "PaymentAuditLog"("reference");

-- CreateIndex
CREATE INDEX "PaymentAuditLog_transactionId_idx" ON "PaymentAuditLog"("transactionId");

-- CreateIndex
CREATE INDEX "PaymentAuditLog_status_idx" ON "PaymentAuditLog"("status");
