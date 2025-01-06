-- DropForeignKey
ALTER TABLE "Lead" DROP CONSTRAINT "Lead_collectedFromSiteId_fkey";

-- DropForeignKey
ALTER TABLE "Site" DROP CONSTRAINT "Site_themeId_fkey";

-- DropForeignKey
ALTER TABLE "Site" DROP CONSTRAINT "Site_userId_fkey";

-- AddForeignKey
ALTER TABLE "Site" ADD CONSTRAINT "Site_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Site" ADD CONSTRAINT "Site_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_collectedFromSiteId_fkey" FOREIGN KEY ("collectedFromSiteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;
