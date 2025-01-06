const { exec } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const fsExtra = require('fs-extra');
const Eleventy = require('@11ty/eleventy');
const { writeCssVariables } = require('./customStyles');

// Async function to generate or update the 11ty site
const generateOrUpdate11tySite = async (site) => {
	// to do - store template on `site` object and pull files from that template's directory
	// maybe future work includes hosting templates to pull from CDN
  const eleventyContentPath = `../sites/${site.subdomain}`;

	const templateName = site.template || 'template1'

  try {
    // Ensure the site directory exists
    await fsExtra.ensureDir(eleventyContentPath);

    await build11tySite(
			`11ty/templates/${templateName}`, 
			eleventyContentPath,
			config => {
				config.addGlobalData('site', site)
				config.setTemplateFormats(['hbs', 'mustache', "html", "css"]);
				config.addPassthroughCopy(path.join(`11ty/templates/${templateName}`, 'styles'));
			}
		);

		await buildStyles(eleventyContentPath, site.styles || { 'primary-brand-color': 'purple' })

    console.log(`Site generated successfully at ${eleventyContentPath}`);
    return true;

  } catch (error) {
    console.error(`Error in generating/updating 11ty site: ${error.message}`);
    throw new Error(`Site generation failed: ${error.message}`);
  }
};


const update11tyContent = async (site, eleventySrcPath) => {
	try {
		const contentData = {
			pageTitle: site.pageTitle,
			heroImage: site.heroImage
		};
	
		console.log('11ty content', contentData);
		await fsExtra.ensureDir(path.join(eleventySrcPath, '_data'));
    console.log(`Site directory at ${eleventySrcPath + '/_data'} is ready.`);
		
		const contentPath = path.join(eleventySrcPath, '_data', 'site.json');
		await fs.writeFile(contentPath, JSON.stringify(contentData, null, 2), 'utf8');
	} catch (err) {
		throw new Error(`Error updating content: ${err.message}`);
	}
};

const build11tySite = async (inputPath, outputPath, configFunc = () => {}) => {
  try {
		console.log(inputPath, outputPath)
    const eleventy = new Eleventy(inputPath, outputPath, {
			config: configFunc 
		});
    await eleventy.write();
    console.log('Eleventy site built successfully');
  } catch (error) {
    throw new Error(`Error building 11ty site: ${error.message}`);
  }
};

const copyTemplateFiles = async (templateName, eleventySrcPath) => {
  try {
    // await fsExtra.copy(`11ty/templates/${templateName}/.eleventy.js`, eleventySrcPath);
    await fsExtra.copy(`11ty/templates/${templateName}`, eleventySrcPath);
    console.log(`Template files copied to ${eleventySrcPath}`);
  } catch (error) {
    throw new Error(`Error copying template files: ${error.message}`);
  }
};

const buildStyles = async (eleventyContentPath, variables) => {
	try {
		const styles = writeCssVariables(variables)
		
		const contentPath = path.join(eleventyContentPath, 'styles', 'variables.css');
		// to do - minify/prettify?
		await fs.writeFile(contentPath, styles);
	} catch(err) {
		throw new Error(`Error building styles: ${err.message}`)
	}
}

module.exports = generateOrUpdate11tySite;
