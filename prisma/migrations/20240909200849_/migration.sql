/*
  Warnings:

  - A unique constraint covering the columns `[subdomain]` on the table `Site` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `subdomain` to the `Site` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Site" ADD COLUMN     "subdomain" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Site_subdomain_key" ON "Site"("subdomain");
