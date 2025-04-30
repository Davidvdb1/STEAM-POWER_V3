-- AlterTable
ALTER TABLE "Answer" ALTER COLUMN "answerValue" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "energyReading" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Group" ALTER COLUMN "code" SET DEFAULT substring(md5(random()::text), 1, 6);
