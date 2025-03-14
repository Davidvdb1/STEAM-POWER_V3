/*
  Warnings:

  - Added the required column `position` to the `Workshop` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Group" ALTER COLUMN "code" SET DEFAULT substring(md5(random()::text), 1, 6);

-- AlterTable
ALTER TABLE "Workshop" ADD COLUMN     "position" INTEGER NOT NULL;
