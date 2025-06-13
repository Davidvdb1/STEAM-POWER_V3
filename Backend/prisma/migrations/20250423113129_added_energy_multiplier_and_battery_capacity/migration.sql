-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "batteryCapacity" DOUBLE PRECISION NOT NULL DEFAULT 500,
ADD COLUMN     "energyMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1,
ALTER COLUMN "code" SET DEFAULT substring(md5(random()::text), 1, 6);
