-- CreateTable
CREATE TABLE "PageView" (
    "id" TEXT NOT NULL,
    "path" VARCHAR(500) NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT NOT NULL,
    "ipAddress" VARCHAR(50),
    "userAgent" TEXT,
    "referrer" VARCHAR(500),
    "country" VARCHAR(100),
    "device" VARCHAR(50),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyReport" (
    "id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPageViews" INTEGER NOT NULL DEFAULT 0,
    "uniqueVisitors" INTEGER NOT NULL DEFAULT 0,
    "newCustomers" INTEGER NOT NULL DEFAULT 0,
    "successfulPayments" INTEGER NOT NULL DEFAULT 0,
    "failedPayments" INTEGER NOT NULL DEFAULT 0,
    "paymentRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "smsSent" BOOLEAN NOT NULL DEFAULT false,
    "smsRecipients" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "smsSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonthlyReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsletterSubscriber" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(100),
    "lastName" VARCHAR(100),
    "phone" VARCHAR(20),
    "status" TEXT NOT NULL DEFAULT 'active',
    "mailchimpId" VARCHAR(255),
    "mailchimpListId" VARCHAR(255),
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferences" JSONB NOT NULL DEFAULT '{"productUpdates": true, "offers": true, "smsOptIn": false}',
    "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),
    "unsubscribedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "source" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PageView_createdAt_idx" ON "PageView"("createdAt");

-- CreateIndex
CREATE INDEX "PageView_userId_idx" ON "PageView"("userId");

-- CreateIndex
CREATE INDEX "PageView_sessionId_idx" ON "PageView"("sessionId");

-- CreateIndex
CREATE INDEX "PageView_path_idx" ON "PageView"("path");

-- CreateIndex
CREATE INDEX "MonthlyReport_createdAt_idx" ON "MonthlyReport"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyReport_month_year_key" ON "MonthlyReport"("month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");

-- CreateIndex
CREATE INDEX "NewsletterSubscriber_email_idx" ON "NewsletterSubscriber"("email");

-- CreateIndex
CREATE INDEX "NewsletterSubscriber_status_idx" ON "NewsletterSubscriber"("status");

-- CreateIndex
CREATE INDEX "NewsletterSubscriber_subscribedAt_idx" ON "NewsletterSubscriber"("subscribedAt");

-- CreateIndex
CREATE INDEX "NewsletterSubscriber_mailchimpId_idx" ON "NewsletterSubscriber"("mailchimpId");
