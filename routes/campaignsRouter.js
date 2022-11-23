var express = require('express');
var router = express.Router();
const Campaign = require('../models/campaign');

/* GET all campaigns in the database */
// currently it returns all the campaigns in the campaign db.
router.get('/', async (req, res) => {
	try {
		const campaigns = await Campaign.find();
		res.json(campaigns);
	} catch (error) {
		console.error(error.message);
		res.status(500).json({ message: error.message });
	}
});

/* GET a specific campaign listing by id. */
router.get('/:id', getCampaign, function (req, res) {
	res.json(res.campaign);
});

/* PATCH a specific campaign listing by id. */
router.patch('/:id', getCampaign, async (req, res) => {
	// update the given campaign information
	let updatedKeys = Object.keys(req.body);
	updatedKeys.forEach(key => {
		res.campaign[key] = req.body[key];
	});

	try {
		const updatedCampaign = await res.campaign.save();
		res.json(updatedCampaign);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
})

/* DELETE a specific campaign listing by id. */
router.delete('/:id', getCampaign, async (req, res) => {
	try {
		await res.campaign.remove();
		res.json({ message: 'Deleted Campaign' });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
})

/* POST a new campaign! */
router.post('/', async (req, res) => {
	const campaign = new Campaign({
		title: req.body.title,
		subtitle: req.body.subtitle,
		isPublished: req.body.isPublished,
		dateCreated: req.body.dateCreated,
		goalAmount: req.body.goalAmount,
		targetDuration: req.body.targetDuration
	})
	try {
		const newCampaign = await campaign.save();
		res.status(201).json(newCampaign);
	} catch (error) {
		res.status(400).json(error);
	}
});

/**
 * This is a middleware function that is to be used whenever we expect a campaign ID from the client
 * We search the database for a campaign with the given id.
 * If something random goes wrong, return status 500
 * If we cannot find a matching campaign, return status 404
 */
async function getCampaign(req, res, next) {
	let campaign;
	try {
		campaign = await Campaign.findById(req.params.id);
		if (campaign == null) {
			return res.status(404).json({ message: 'Cannot find campaign' });
		}
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}

	res.campaign = campaign;
	next();
};

module.exports = router;
