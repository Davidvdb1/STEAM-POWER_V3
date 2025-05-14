-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'TEACHER');

-- CreateEnum
CREATE TYPE "EnergyType" AS ENUM ('SOLAR', 'WATER', 'WIND');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Camp" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "minAge" INTEGER NOT NULL,
    "maxAge" INTEGER NOT NULL,
    "picture" TEXT NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "address" TEXT NOT NULL,

    CONSTRAINT "Camp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workshop" (
    "id" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "campId" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL,

    CONSTRAINT "Workshop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "members" TEXT NOT NULL DEFAULT '',
    "microbitId" TEXT NOT NULL DEFAULT '',
    "code" TEXT NOT NULL DEFAULT substring(md5(random()::text), 1, 6),
    "energy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "energyMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "batteryLevel" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "batteryCapacity" DOUBLE PRECISION NOT NULL DEFAULT 500,
    "bonusScore" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnergyData" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "EnergyType" NOT NULL,
    "value" INTEGER NOT NULL,
    "pin" INTEGER NOT NULL,

    CONSTRAINT "EnergyData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "questionStatement" TEXT NOT NULL,
    "energyType" "EnergyType" NOT NULL,
    "picture" TEXT NOT NULL,
    "maxTries" INTEGER NOT NULL DEFAULT 0,
    "wattage" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "errorMargin" DOUBLE PRECISION NOT NULL DEFAULT 0.5,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "answerValue" DOUBLE PRECISION NOT NULL,
    "energyReading" DOUBLE PRECISION NOT NULL,
    "errorMargin" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Group_name_key" ON "Group"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Group_code_key" ON "Group"("code");

-- AddForeignKey
ALTER TABLE "Workshop" ADD CONSTRAINT "Workshop_campId_fkey" FOREIGN KEY ("campId") REFERENCES "Camp"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnergyData" ADD CONSTRAINT "EnergyData_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
