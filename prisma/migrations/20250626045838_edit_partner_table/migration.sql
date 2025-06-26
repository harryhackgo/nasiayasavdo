-- DropForeignKey
ALTER TABLE "Sale" DROP CONSTRAINT "Sale_stockEntryId_fkey";

-- AlterTable
ALTER TABLE "Sale" ALTER COLUMN "stockEntryId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_stockEntryId_fkey" FOREIGN KEY ("stockEntryId") REFERENCES "StockEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
