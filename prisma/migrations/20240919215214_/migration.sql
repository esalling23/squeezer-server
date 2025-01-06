/*
  Warnings:

  - A unique constraint covering the columns `[themeId]` on the table `Site` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `themeId` to the `Site` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Site" ADD COLUMN     "themeId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Theme" (
    "id" SERIAL NOT NULL,
    "primaryBrandColor" TEXT,
    "headingTextColor" TEXT,
    "bodyTextColor" TEXT,
    "headingTextFont" TEXT,
    "bodyTextFont" TEXT,

    CONSTRAINT "Theme_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Site_themeId_key" ON "Site"("themeId");

-- AddForeignKey
ALTER TABLE "Site" ADD CONSTRAINT "Site_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
