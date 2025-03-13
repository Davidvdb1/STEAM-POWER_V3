/*
  Warnings:

  - You are about to drop the `_CampToWorkshop` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `campId` to the `Workshop` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_CampToWorkshop" DROP CONSTRAINT "_CampToWorkshop_A_fkey";

-- DropForeignKey
ALTER TABLE "_CampToWorkshop" DROP CONSTRAINT "_CampToWorkshop_B_fkey";

-- AlterTable
ALTER TABLE "Group" ALTER COLUMN "code" SET DEFAULT substring(md5(random()::text), 1, 6);

-- AlterTable
ALTER TABLE "Workshop" ADD COLUMN     "campId" TEXT NOT NULL;

-- DropTable
DROP TABLE "_CampToWorkshop";

-- AddForeignKey
ALTER TABLE "Workshop" ADD CONSTRAINT "Workshop_campId_fkey" FOREIGN KEY ("campId") REFERENCES "Camp"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
