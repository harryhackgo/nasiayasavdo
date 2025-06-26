/*
  Warnings:

  - The values [PARTIAL,PAID] on the enum `debt_status_enum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "debt_status_enum_new" AS ENUM ('OPEN', 'OVERDUE', 'CLOSED');
ALTER TABLE "Debt" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Debt" ALTER COLUMN "status" TYPE "debt_status_enum_new" USING ("status"::text::"debt_status_enum_new");
ALTER TYPE "debt_status_enum" RENAME TO "debt_status_enum_old";
ALTER TYPE "debt_status_enum_new" RENAME TO "debt_status_enum";
DROP TYPE "debt_status_enum_old";
ALTER TABLE "Debt" ALTER COLUMN "status" SET DEFAULT 'OPEN';
COMMIT;
