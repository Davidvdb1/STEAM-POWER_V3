-- AlterTable
ALTER TABLE "Answer" ADD COLUMN     "errorMargin" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Group" ALTER COLUMN "code" SET DEFAULT substring(md5(random()::text), 1, 6);
