/*
  Warnings:

  - You are about to drop the column `markdown` on the `Workshop` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Workshop` table. All the data in the column will be lost.
  - Added the required column `html` to the `Workshop` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Group" ALTER COLUMN "code" SET DEFAULT substring(md5(random()::text), 1, 6);

-- AlterTable
ALTER TABLE "Workshop" DROP COLUMN "markdown",
DROP COLUMN "name",
ADD COLUMN     "html" TEXT NOT NULL;
