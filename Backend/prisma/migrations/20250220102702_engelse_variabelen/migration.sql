/*
  Warnings:

  - The values [LEERKRACHT,GAST] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `naam` on the `Workshop` table. All the data in the column will be lost.
  - You are about to drop the `Kamp` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_KampToWorkshop` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `name` to the `Workshop` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'TEACHER', 'GUEST');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'GUEST';
COMMIT;

-- DropForeignKey
ALTER TABLE "_KampToWorkshop" DROP CONSTRAINT "_KampToWorkshop_A_fkey";

-- DropForeignKey
ALTER TABLE "_KampToWorkshop" DROP CONSTRAINT "_KampToWorkshop_B_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'GUEST';

-- AlterTable
ALTER TABLE "Workshop" DROP COLUMN "naam",
ADD COLUMN     "name" TEXT NOT NULL;

-- DropTable
DROP TABLE "Kamp";

-- DropTable
DROP TABLE "_KampToWorkshop";

-- CreateTable
CREATE TABLE "Camp" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "adress" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "minAge" INTEGER NOT NULL,
    "maxAge" INTEGER NOT NULL,
    "picture" TEXT NOT NULL,
    "archived" BOOLEAN NOT NULL,

    CONSTRAINT "Camp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CampToWorkshop" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CampToWorkshop_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CampToWorkshop_B_index" ON "_CampToWorkshop"("B");

-- AddForeignKey
ALTER TABLE "_CampToWorkshop" ADD CONSTRAINT "_CampToWorkshop_A_fkey" FOREIGN KEY ("A") REFERENCES "Camp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CampToWorkshop" ADD CONSTRAINT "_CampToWorkshop_B_fkey" FOREIGN KEY ("B") REFERENCES "Workshop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
