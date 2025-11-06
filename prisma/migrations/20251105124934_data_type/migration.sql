/*
  Warnings:

  - Added the required column `strategy` to the `DataItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalChunks` to the `DataItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Chat" DROP CONSTRAINT "Chat_historyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DataItem" DROP CONSTRAINT "DataItem_datasourceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Datasource" DROP CONSTRAINT "Datasource_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."History" DROP CONSTRAINT "History_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_chatId_fkey";

-- AlterTable
ALTER TABLE "DataItem" ADD COLUMN     "ChunksIds" TEXT[],
ADD COLUMN     "strategy" TEXT NOT NULL,
ADD COLUMN     "totalChunks" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "History"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Datasource" ADD CONSTRAINT "Datasource_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataItem" ADD CONSTRAINT "DataItem_datasourceId_fkey" FOREIGN KEY ("datasourceId") REFERENCES "Datasource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
