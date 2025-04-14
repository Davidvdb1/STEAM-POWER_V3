/*
  Warnings:

  - Added the required column `answerValue` to the `Answer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `energyReading` to the `Answer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isCorrect` to the `Answer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Answer" ADD COLUMN     "answerValue" INTEGER NOT NULL,
ADD COLUMN     "energyReading" INTEGER NOT NULL,
ADD COLUMN     "isCorrect" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "Group" ALTER COLUMN "code" SET DEFAULT substring(md5(random()::text), 1, 6);
