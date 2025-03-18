-- AlterTable
ALTER TABLE "EnergyData" ADD COLUMN     "pin" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Group" ALTER COLUMN "code" SET DEFAULT substring(md5(random()::text), 1, 6);
