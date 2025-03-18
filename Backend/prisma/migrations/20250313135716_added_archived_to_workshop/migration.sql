/*
  Warnings:

  - You are about to drop the column `energy` on the `EnergyData` table. All the data in the column will be lost.
  - Added the required column `value` to the `EnergyData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `archived` to the `Workshop` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EnergyData" DROP COLUMN "energy",
ADD COLUMN     "value" INTEGER NOT NULL,
ALTER COLUMN "date" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Group" ALTER COLUMN "code" SET DEFAULT substring(md5(random()::text), 1, 6);

-- AlterTable
ALTER TABLE "Workshop" ADD COLUMN     "archived" BOOLEAN NOT NULL;
