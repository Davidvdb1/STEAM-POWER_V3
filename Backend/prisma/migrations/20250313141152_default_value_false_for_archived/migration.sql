-- AlterTable
ALTER TABLE "Camp" ALTER COLUMN "archived" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Group" ALTER COLUMN "code" SET DEFAULT substring(md5(random()::text), 1, 6);

-- AlterTable
ALTER TABLE "Workshop" ALTER COLUMN "archived" SET DEFAULT false;
