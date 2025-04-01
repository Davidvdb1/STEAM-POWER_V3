-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable
<<<<<<<< HEAD:Backend/prisma/migrations/20250331121312_added_max_tries_to_question/migration.sql
ALTER TABLE "Question" ADD COLUMN     "maxTries" INTEGER NOT NULL DEFAULT 0;
========
ALTER TABLE "Group" ALTER COLUMN "code" SET DEFAULT substring(md5(random()::text), 1, 6);
>>>>>>>> main:Backend/prisma/migrations/20250331081731_username_not_unique/migration.sql
