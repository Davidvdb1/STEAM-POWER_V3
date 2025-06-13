-- AlterTable
ALTER TABLE "Group" ALTER COLUMN "code" SET DEFAULT substring(md5(random()::text), 1, 6),
ALTER COLUMN "energy" SET DEFAULT 0,
ALTER COLUMN "energy" SET DATA TYPE DOUBLE PRECISION;
