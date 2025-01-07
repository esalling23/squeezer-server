/*
  Warnings:

  - You are about to drop the column `bodyTextFont` on the `Theme` table. All the data in the column will be lost.
  - You are about to drop the column `headingTextFont` on the `Theme` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Theme" DROP COLUMN "bodyTextFont",
DROP COLUMN "headingTextFont",
ADD COLUMN     "bodyFontId" INTEGER,
ADD COLUMN     "headingFontId" INTEGER;

-- CreateTable
CREATE TABLE "Font" (
    "id" SERIAL NOT NULL,
    "family" TEXT NOT NULL,
    "url" TEXT,

    CONSTRAINT "Font_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Theme" ADD CONSTRAINT "Theme_headingFontId_fkey" FOREIGN KEY ("headingFontId") REFERENCES "Font"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Theme" ADD CONSTRAINT "Theme_bodyFontId_fkey" FOREIGN KEY ("bodyFontId") REFERENCES "Font"("id") ON DELETE SET NULL ON UPDATE CASCADE;
