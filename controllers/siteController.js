const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const prisma = require('../lib/prismaClient');
const generateOrUpdate11tySite = require('../lib/generate11tySite');
const { extractCssVariables, transformKeys } = require('../lib/customStyles');

// Create a new site
const createSite = async (req, res, next) => {
  try {
		const subdomain = uuidv4();

		const templateName = 'template1'
		const themePath = path.join(__dirname, `../11ty/templates/${templateName}/styles/variables.css`)
		const templateTheme = fs.readFileSync(themePath, 'utf8');
		const themeStylesObj = transformKeys(
			extractCssVariables(templateTheme)
		)

		const site = await prisma.site.create({
			data: {
				subdomain,
				pageTitle: 'New Page',
				heroImage: '',
				// dataCollectionTypes: dataCollectionTypes.split(','),
				user: { connect: { id: req.user.id } },  // Attach site to the authenticated user
				theme: {
					create: themeStylesObj,
					// userId: req.user.id
				}
			},
      include: { theme: true }
		});

		await generateOrUpdate11tySite(site);

    res.status(201).json(site);
  } catch (error) {
    next(error)
  }
};

// Get all public sites
const getAllSites = async (req, res, next) => {
  try {
    const sites = await prisma.site.findMany();
    res.status(200).json(sites);
  } catch (error) {
    next(error)
  }
};

// Get one site by its id
const getSite = async (req, res, next) => {
  try {
		const { id } = req.params;
		console.log(req.params)
    const site = await prisma.site.findUnique({
			where: { id: parseInt(id) },
			include: { theme: true }
		});
    res.status(200).json(site);
  } catch (error) {
    next(error)
  }
};

// Get one site by its subdomain
const getSubdomainSite = async (req, res, next) => {
  try {
		const { subdomain } = req.params;
    const site = await prisma.site.findUnique({
			where: { subdomain }
		});
    res.status(200).json(site);
  } catch (error) {
    next(error)
  }
};

// Get all sites for the authenticated user
const getMySites = async (req, res, next) => {
  try {
    const sites = await prisma.site.findMany({
      where: {
        userId: req.user.id,  // Filter by authenticated user
      },
    });
    res.status(200).json(sites);
  } catch (error) {
    next(error);
  }
};

// Update a site (only if the user owns it)
const updateSite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { pageTitle, tagline, subdomain, style } = req.body;

    // Check ownership
    const site = await prisma.site.findUnique({
      where: { id: parseInt(id) },
      include: { user: true }
    });
		
    if (!site || site.userId !== req.user.id) {
      return next(new Error('You are not authorized to update this site.'));
    }

    
    const parsedStyles = JSON.parse(style)

    // Future work - link to existing fonts if user selects one of those?
    const getFontLink = fontObj => ({
      create: {
        family: fontObj.family,
        ...(fontObj.url && { url: fontObj.url })
      }
    })

		await prisma.theme.update({
			where: { id: site.themeId },
			data: {
        // Colors
				...(parsedStyles.primaryBrandColor && { primaryBrandColor: parsedStyles.primaryBrandColor } ),
				...(parsedStyles.headingTextColor && { headingTextColor: parsedStyles.headingTextColor } ),
				...(parsedStyles.bodyTextColor && { bodyTextColor: parsedStyles.bodyTextColor } ),
				
        // Fonts
        ...(parsedStyles.headingTextFont && { 
          headingTextFont: getFontLink(parsedStyles.headingTextFont)
        } ),
				...(parsedStyles.bodyTextFont && { 
          bodyTextFont: getFontLink(parsedStyles.bodyTextFont)
        } ),
			}
		})

    const updatedSite = await prisma.site.update({
      where: { id: parseInt(id) },
      data: {
				...(pageTitle && { pageTitle }),
				...(tagline && { tagline }),
				...(req.file && { heroImage: req.file?.path }),
				...(subdomain && { subdomain }),
        // dataCollectionTypes: dataCollectionTypes ? dataCollectionTypes.split(',') : undefined,
      },
      include: {
        theme: { 
          select: {
            primaryBrandColor: true,
            headingTextColor: true,
            bodyTextColor: true,
            headingTextFont: true,
            bodyTextFont: true,
          }
        }
      }
    });

		console.log({updatedSite});

		await generateOrUpdate11tySite(updatedSite);

    res.status(200).json(updatedSite);
  } catch (error) {
    next(error)
  }
};

// Delete a site (only if the user owns it)
const deleteSite = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check ownership
    const site = await prisma.site.findUnique({
      where: { id: parseInt(id) },
      include: { user: true }
    });
    if (!site || site.userId !== req.user.uid) {
      return res.status(403).json({ error: 'You are not authorized to delete this site.' });
    }

    await prisma.site.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
	createSite,
	getSite,
	getMySites,
	getAllSites,
	updateSite,
	deleteSite,
	getSubdomainSite,
}