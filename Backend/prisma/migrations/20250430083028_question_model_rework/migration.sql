/*
  Warnings:

  - You are about to drop the column `solarQuestion` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `waterQuestion` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `windQuestion` on the `Question` table. All the data in the column will be lost.
  - Added the required column `energyType` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionStatement` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Group" ALTER COLUMN "code" SET DEFAULT substring(md5(random()::text), 1, 6);

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "solarQuestion",
DROP COLUMN "waterQuestion",
DROP COLUMN "windQuestion",
ADD COLUMN     "energyType" "EnergyType" NOT NULL,
ADD COLUMN     "questionStatement" TEXT NOT NULL;
