const { exec } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const fsExtra = require('fs-extra');
const Eleventy = require('@11ty/eleventy');
const { writeCssVariables, transformKeys, CharCase, parseTheme } = require('./customStyles');
const { removeObjNullValues } = require('./helpers');

// Async function to generate or update the 11ty site
const generateOrUpdate11tySite = async (site) => {
	// to do - store template on `site` object and pull files from that template's directory
	// maybe future work includes hosting templates to pull from CDN
  const eleventyContentPath = `../sites/${site.subdomain}`;

  // Future work - site templates not implemented
	const templateName = site.template || 'template1'

  const { vars, fonts } = removeObjNullValues(parseTheme(site.theme))

  try {
    // Ensure the site directory exists
    await fsExtra.ensureDir(eleventyContentPath);

    await build11tySite(
			`11ty/templates/${templateName}`, 
			eleventyContentPath,
			config => {
        const serverUrl = process.env.ENV === 'production' ? 'https://squeezer.eronsalling.me' : 'http://localhost:' + process.env.PORT
        config.addGlobalData('serverUrl', serverUrl)
				config.addGlobalData('site', site)
				config.addGlobalData('fontLinks', fonts)
				config.setTemplateFormats(['hbs', 'mustache', "html", "css"]);
				config.addPassthroughCopy(path.join(`11ty/templates/${templateName}`, 'styles'));
			}
		);

    const styleVars = transformKeys(vars, CharCase.KEBAB)
		await buildStyles(eleventyContentPath, styleVars)

    console.log(`Site generated successfully at ${eleventyContentPath}`);
    return true;

  } catch (error) {
    console.error(`Error in generating/updating 11ty site: ${error.message}`);
    throw new Error(`Site generation failed: ${error.message}`);
  }
};

const build11tySite = async (inputPath, outputPath, configFunc = () => {}) => {
  try {
    const eleventy = new Eleventy(inputPath, outputPath, {
			config: configFunc 
		});
    await eleventy.write();
    console.log('Eleventy site built successfully');
  } catch (error) {
    throw new Error(`Error building 11ty site: ${error.message}`);
  }
};

const buildStyles = async (eleventyContentPath, variables) => {
	try {
		const styles = writeCssVariables(variables)
		
		const contentPath = path.join(eleventyContentPath, 'styles', 'userVariables.css');
		// to do - minify/prettify?
		await fs.writeFile(contentPath, styles);
	} catch(err) {
		throw new Error(`Error building styles: ${err.message}`)
	}
}

module.exports = generateOrUpdate11tySite;
