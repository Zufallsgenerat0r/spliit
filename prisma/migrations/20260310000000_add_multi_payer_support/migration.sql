-- CreateTable
CREATE TABLE "ExpensePaidBy" (
    "expenseId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "shares" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "ExpensePaidBy_pkey" PRIMARY KEY ("expenseId","participantId")
);

-- AddColumn
ALTER TABLE "Expense" ADD COLUMN "paidBySplitMode" "SplitMode" NOT NULL DEFAULT 'BY_AMOUNT';

-- AddForeignKey
ALTER TABLE "ExpensePaidBy" ADD CONSTRAINT "ExpensePaidBy_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpensePaidBy" ADD CONSTRAINT "ExpensePaidBy_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "ExpensePaidBy_participantId_idx" ON "ExpensePaidBy"("participantId");

-- Migrate existing data: each expense's paidById becomes a single ExpensePaidBy row
-- with shares = amount (matching BY_AMOUNT split mode)
-- Use GREATEST to guard against zero-amount expenses causing division-by-zero
INSERT INTO "ExpensePaidBy" ("expenseId", "participantId", "shares")
SELECT "id", "paidById", GREATEST("amount", 1) FROM "Expense";
