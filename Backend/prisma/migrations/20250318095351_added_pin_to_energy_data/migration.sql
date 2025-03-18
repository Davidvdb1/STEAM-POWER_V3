/*
  Warnings:

  - Added the required column `pin` to the `EnergyData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EnergyData" ADD COLUMN     "pin" INTEGER NOT NULL;
