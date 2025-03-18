/*
  Warnings:

  - Added the required column `score` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Group" ALTER COLUMN "code" SET DEFAULT substring(md5(random()::text), 1, 6);

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "score" INTEGER NOT NULL;
