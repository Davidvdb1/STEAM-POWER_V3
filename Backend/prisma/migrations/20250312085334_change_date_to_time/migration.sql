/*
  Warnings:

  - You are about to drop the column `date` on the `EnergyData` table. All the data in the column will be lost.
  - You are about to drop the column `energy` on the `EnergyData` table. All the data in the column will be lost.
  - Added the required column `value` to the `EnergyData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EnergyData" DROP COLUMN "date",
DROP COLUMN "energy",
ADD COLUMN     "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "value" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Group" ALTER COLUMN "code" SET DEFAULT substring(md5(random()::text), 1, 6);
