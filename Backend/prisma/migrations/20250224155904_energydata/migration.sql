-- CreateEnum
CREATE TYPE "EnergyType" AS ENUM ('SOLAR', 'WATER', 'WIND');

-- AlterTable
ALTER TABLE "Group" ALTER COLUMN "code" SET DEFAULT substring(md5(random()::text), 1, 6);

-- CreateTable
CREATE TABLE "EnergyData" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "energy" INTEGER NOT NULL,
    "type" "EnergyType" NOT NULL,

    CONSTRAINT "EnergyData_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EnergyData" ADD CONSTRAINT "EnergyData_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
