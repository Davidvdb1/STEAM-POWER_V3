-- CreateTable
CREATE TABLE "Kamp" (
    "id" TEXT NOT NULL,
    "naam" TEXT NOT NULL,
    "startdatum" TIMESTAMP(3) NOT NULL,
    "einddatum" TIMESTAMP(3) NOT NULL,
    "adres" TEXT NOT NULL,
    "starttijd" TEXT NOT NULL,
    "eindtijd" TEXT NOT NULL,
    "minLeeftijd" INTEGER NOT NULL,
    "maxLeeftijd" INTEGER NOT NULL,
    "foto" TEXT NOT NULL,
    "gearchiveerd" BOOLEAN NOT NULL,

    CONSTRAINT "Kamp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workshop" (
    "id" TEXT NOT NULL,
    "naam" TEXT NOT NULL,
    "markdown" TEXT NOT NULL,

    CONSTRAINT "Workshop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_KampToWorkshop" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_KampToWorkshop_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_KampToWorkshop_B_index" ON "_KampToWorkshop"("B");

-- AddForeignKey
ALTER TABLE "_KampToWorkshop" ADD CONSTRAINT "_KampToWorkshop_A_fkey" FOREIGN KEY ("A") REFERENCES "Kamp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_KampToWorkshop" ADD CONSTRAINT "_KampToWorkshop_B_fkey" FOREIGN KEY ("B") REFERENCES "Workshop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
