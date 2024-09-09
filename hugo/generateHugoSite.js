const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to update or generate Hugo site
const generateOrUpdateHugoSite = (site, next) => {
  const hugoContentPath = `./server/hugo/sites/${site.pageTitle.replace(' ', '_')}`;
  
  // Check if the site already exists
  if (fs.existsSync(hugoContentPath)) {
    console.log(`Site already exists at ${hugoContentPath}, updating...`);
    
    updateHugoContent(site, hugoContentPath, next);
  } else {
    console.log(`Creating new site at ${hugoContentPath}`);
    
    exec(`hugo new site ${hugoContentPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error creating site: ${error.message}`);
        next(error);
        return;
      }

      updateHugoContent(site, hugoContentPath, next);
    });
  }
};

// Function to update Hugo site content
const updateHugoContent = (site, hugoContentPath, next) => {
  const pageMarkdown = `
---
title: "${site.pageTitle}"
heroImage: "${site.heroImage}"
---
  `;
  
  const contentPath = path.join(hugoContentPath, 'content', '_index.md');

  fs.writeFileSync(contentPath, pageMarkdown);

  exec(`cp -r ./server/hugo/template/* ${hugoContentPath}/`, (err) => {
    if (err) {
      console.error(`Error copying template: ${err.message}`);
      next(err);
      return;
    }

    exec(`hugo -s ${hugoContentPath}`, (buildErr) => {
      if (buildErr) {
        console.error(`Error building site: ${buildErr.message}`);
        next(buildErr);
      } else {
        console.log(`Site built successfully at ${hugoContentPath}/public`);
        next(null);
      }
    });
  });
};

module.exports = generateOrUpdateHugoSite;
