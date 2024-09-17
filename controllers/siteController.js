const { v4: uuidv4 } = require('uuid');
const prisma = require('../lib/prismaClient');
const { cloudinary } = require('../lib/cloudinaryService');
// const generateOrUpdateHugoSite = require('../lib/generateHugoSite');
const generateOrUpdate11tySite = require('../lib/generate11tySite');

// Create a new site
const createSite = async (req, res, next) => {
  try {
		
		// Upload heroImage to Cloudinary
    // const heroImage = req.file ? req.file.path : null;
		
		const subdomain = uuidv4();
		const site = await prisma.site.create({
			data: {
				subdomain,
				pageTitle: 'New Page',
				heroImage: '',
				// dataCollectionTypes: dataCollectionTypes.split(','),
				userId: req.user.id,  // Attach site to the authenticated user
			},
		});

		res.locals.site = site;

    res.status(201).json(site);
  } catch (error) {
    next(error)
  }
};

// Get all public sites
const getAllSites = async (req, res) => {
  try {
    const sites = await prisma.site.findMany();
    res.status(200).json(sites);
  } catch (error) {
    next(error)
  }
};

// Get one site by its subdomain
const getSubdomainSite = async (req, res) => {
  try {
		const { subdomain } = req.body;
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
    const { pageTitle, subdomain } = req.body;

    // Check ownership
    const site = await prisma.site.findUnique({
      where: { id: parseInt(id) },
      include: { user: true }
    });
		// console.log(site)
		// console.log(site.user, req.user)
    if (!site || site.userId !== req.user.id) {
      return next(new Error('You are not authorized to update this site.'));
    }

    const updatedSite = await prisma.site.update({
      where: { id: parseInt(id) },
      data: {
        pageTitle: pageTitle || site.pageTitle,
        heroImage: req.file?.path || site.heroImage,
				subdomain: subdomain || site.subdomain,
        // dataCollectionTypes: dataCollectionTypes ? dataCollectionTypes.split(',') : undefined,
      },
    });

		console.log(updatedSite);

		await generateOrUpdate11tySite(updatedSite);

    res.status(200).json(updatedSite);
  } catch (error) {
    next(error)
  }
};

// Delete a site (only if the user owns it)
const deleteSite = async (req, res) => {
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
	getMySites,
	getAllSites,
	updateSite,
	deleteSite,
	getSubdomainSite,
}