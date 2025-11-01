-- CreateEnum
CREATE TYPE "RoleAccess" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "roleAccess" "RoleAccess" NOT NULL DEFAULT 'USER';
