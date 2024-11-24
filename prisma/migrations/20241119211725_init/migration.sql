/*
  Warnings:

  - You are about to drop the column `gen` on the `Draw` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[giverId]` on the table `Draw` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Draw_giverId_gen_key";

-- AlterTable
ALTER TABLE "Draw" DROP COLUMN "gen";

-- CreateIndex
CREATE UNIQUE INDEX "Draw_giverId_key" ON "Draw"("giverId");
