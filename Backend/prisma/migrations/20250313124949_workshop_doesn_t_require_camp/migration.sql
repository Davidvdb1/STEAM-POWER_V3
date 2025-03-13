-- DropForeignKey
ALTER TABLE "Workshop" DROP CONSTRAINT "Workshop_campId_fkey";

-- AlterTable
ALTER TABLE "Group" ALTER COLUMN "code" SET DEFAULT substring(md5(random()::text), 1, 6);

-- AlterTable
ALTER TABLE "Workshop" ALTER COLUMN "campId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Workshop" ADD CONSTRAINT "Workshop_campId_fkey" FOREIGN KEY ("campId") REFERENCES "Camp"("id") ON DELETE SET NULL ON UPDATE CASCADE;
