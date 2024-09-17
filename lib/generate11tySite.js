const { exec } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const fsExtra = require('fs-extra');
const Eleventy = require('@11ty/eleventy');

// Async function to generate or update the 11ty site
const generateOrUpdate11tySite = async (site) => {
	// to do - store template on `site` object and pull files from that template's directory
	// maybe future work includes hosting templates to pull from CDN
  const eleventyContentPath = `../sites/${site.subdomain}`;
  const eleventyOutputPath = path.join(eleventyContentPath, '_site');

  try {
    // Ensure the site directory exists
    await fsExtra.ensureDir(eleventyContentPath);
    console.log(`Site directory at ${eleventyContentPath} is ready.`);
    
    await copyTemplateFiles(eleventyContentPath);
    await update11tyContent(site, eleventyContentPath);
    await build11tySite(path.join(eleventyContentPath, '_src'), eleventyOutputPath);

    console.log(`Site generated successfully at ${eleventyOutputPath}`);
    return true;

  } catch (error) {
    console.error(`Error in generating/updating 11ty site: ${error.message}`);
    throw new Error(`Site generation failed: ${error.message}`);
  }
};


const update11tyContent = async (site, eleventyContentPath) => {
	try {
		const contentData = {
			pageTitle: site.pageTitle,
			heroImage: site.heroImage
		};
	
		console.log('11ty content', contentData);
		await fsExtra.ensureDir(path.join(eleventyContentPath, '_src', '_data'));
    console.log(`Site directory at ${eleventyContentPath + '/_data'} is ready.`);
		
		const contentPath = path.join(eleventyContentPath, '_src/_data', 'home.json');
		await fs.writeFile(contentPath, JSON.stringify(contentData, null, 2), 'utf8');
	} catch (err) {
		throw new Error(`Error updating content: ${err.message}`);
	}
};

const build11tySite = async (inputPath, outputPath) => {
  try {
		console.log(inputPath, outputPath)
    const eleventy = new Eleventy(inputPath, outputPath);
    await eleventy.write();
    console.log('Eleventy site built successfully');
  } catch (error) {
    throw new Error(`Error building 11ty site: ${error.message}`);
  }
};

const copyTemplateFiles = async (eleventyContentPath) => {
  try {
    await fsExtra.copy('11ty/templates', eleventyContentPath);
    console.log(`Template files copied to ${eleventyContentPath}`);
  } catch (error) {
    throw new Error(`Error copying template files: ${error.message}`);
  }
};

module.exports = generateOrUpdate11tySite;
