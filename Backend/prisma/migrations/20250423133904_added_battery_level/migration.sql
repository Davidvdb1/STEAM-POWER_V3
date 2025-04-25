-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "batteryLevel" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "code" SET DEFAULT substring(md5(random()::text), 1, 6);
