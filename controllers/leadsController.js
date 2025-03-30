const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const prisma = require('../lib/prismaClient');

// Create a new lead
const createLead = async (req, res, next) => {
  try {
		console.log(req.params)
		const data = {
			email: req.body.email,
			fullName: req.body.fullName,
			collectedFromSite: { 
        connect: { 
          id: parseInt(req.params.siteId)
        } 
      }
		}

		const lead = await prisma.lead.create({
			data,
		});

    res.status(201).json(lead);
  } catch (error) {
    next(error)
  }
};

// Get all public leads
const getAllLeads = async (req, res, next) => {
  try {
		const { siteId } = req.params;
    const leads = await prisma.lead.findMany({
			where: { collectedFromSiteId: parseInt(siteId) }
		});
    res.status(200).json(leads);
  } catch (error) {
    next(error)
  }
};

// Get one lead by its id
const getLead = async (req, res, next) => {
  try {
		const { siteId, leadId } = req.params;
    const lead = await prisma.lead.findUnique({
			where: { id: parseInt(leadId) }
		});
    res.status(200).json(lead);
  } catch (error) {
    next(error)
  }
};

module.exports = {
	createLead,
	getLead,
	getAllLeads,
}