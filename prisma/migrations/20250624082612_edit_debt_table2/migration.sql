-- AlterTable
ALTER TABLE "Debt" ADD COLUMN     "is_late" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "next_due_date" TIMESTAMP(3);
