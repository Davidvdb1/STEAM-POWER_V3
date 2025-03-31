-- AlterTable
ALTER TABLE "Group" ALTER COLUMN "code" SET DEFAULT substring(md5(random()::text), 1, 6);

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "maxTries" INTEGER NOT NULL DEFAULT 0;
