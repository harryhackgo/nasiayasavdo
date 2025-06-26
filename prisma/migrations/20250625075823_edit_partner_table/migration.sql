-- CreateEnum
CREATE TYPE "partner_role_enum" AS ENUM ('SELLER', 'CUSTOMER');

-- AlterTable
ALTER TABLE "Partner" ADD COLUMN     "role" "partner_role_enum" NOT NULL DEFAULT 'CUSTOMER';
