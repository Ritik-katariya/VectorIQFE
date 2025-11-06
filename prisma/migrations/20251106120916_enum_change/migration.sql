/*
  Warnings:

  - The values [PDF] on the enum `DataType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DataType_new" AS ENUM ('DOCUMENT', 'TEXT', 'IMAGE', 'URL');
ALTER TABLE "DataItem" ALTER COLUMN "dataType" TYPE "DataType_new" USING ("dataType"::text::"DataType_new");
ALTER TYPE "DataType" RENAME TO "DataType_old";
ALTER TYPE "DataType_new" RENAME TO "DataType";
DROP TYPE "public"."DataType_old";
COMMIT;
