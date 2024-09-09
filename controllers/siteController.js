const prisma = require('../lib/prismaClient');
const { cloudinary } = require('../lib/cloudinaryService');
const generateOrUpdateHugoSite = require('../hugo/generateHugoSite');

// Create a new site
const createSite = async (req, res, next) => {
  try {
    const { pageTitle, subdomain } = req.body;

    // Upload heroImage to Cloudinary
    // const heroImage = req.file ? req.file.path : null;

    const site = await prisma.site.create({
      data: {
        pageTitle,
				subdomain,
        heroImage: '',
        // dataCollectionTypes: dataCollectionTypes.split(','),
        userId: req.user.id,  // Attach site to the authenticated user
      },
    });

		// to do - better hugo error handling
		generateOrUpdateHugoSite(site, next);

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

// Get all sites for the authenticated user
const getMySites = async (req, res, next) => {
  try {
    const sites = await prisma.site.findMany({
      where: {
        userId: req.user.uid,  // Filter by authenticated user
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
    const { pageTitle, subdomain, heroImage } = req.body;

    // Check ownership
    const site = await prisma.site.findUnique({
      where: { id: parseInt(id) },
      include: { user: true }
    });
    if (!site || site.userId !== req.user.id) {
      return next(new Error('You are not authorized to update this site.'));
    }

    // If a new image is uploaded, update the heroImage
    // let heroImage = req.file ? req.file.path : null;

    const updatedSite = await prisma.site.update({
      where: { id: parseInt(id) },
      data: {
        pageTitle,
        heroImage,
				subdomain,
        // dataCollectionTypes: dataCollectionTypes ? dataCollectionTypes.split(',') : undefined,
      },
    });

		generateOrUpdateHugoSite(updatedSite, next);

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
}