-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable
ALTER TABLE "Group" ALTER COLUMN "code" SET DEFAULT substring(md5(random()::text), 1, 6);
