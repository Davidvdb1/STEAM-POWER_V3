/*
  Warnings:

  - You are about to drop the column `description` on the `Group` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Group" DROP COLUMN "description",
ADD COLUMN     "members" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "microbitId" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "code" SET DEFAULT substring(md5(random()::text), 1, 6);
