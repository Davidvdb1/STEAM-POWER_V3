/*
  Warnings:

  - You are about to drop the column `currenciesId` on the `Checkpoint` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[currencyId]` on the table `Checkpoint` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `currencyId` to the `Checkpoint` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Checkpoint" DROP CONSTRAINT "Checkpoint_currenciesId_fkey";

-- DropIndex
DROP INDEX "Checkpoint_currenciesId_key";

-- AlterTable
ALTER TABLE "Checkpoint" DROP COLUMN "currenciesId",
ADD COLUMN     "currencyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Group" ALTER COLUMN "code" SET DEFAULT substring(md5(random()::text), 1, 6);

-- CreateIndex
CREATE UNIQUE INDEX "Checkpoint_currencyId_key" ON "Checkpoint"("currencyId");

-- AddForeignKey
ALTER TABLE "Checkpoint" ADD CONSTRAINT "Checkpoint_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
