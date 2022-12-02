var express = require('express');
const campaign = require('../models/campaign');
var router = express.Router();
const Campaign = require('../models/campaign');
const User = require('../models/user');

/* GET all campaigns in the database */
// currently it returns all the campaigns in the campaign db.
router.get('/', async (req, res) => {
	try {
		// Campaign.deleteMany();
		const campaigns = await Campaign.find();
		res.json(campaigns);
	} catch (error) {
		console.error(error.message);
		res.status(500).json({ message: error.message });
	}
});

/* GET a specific campaign listing by id. */
router.get('/:campaignID', getCampaign, function (req, res) {
	res.json(res.campaign);
});

/* PATCH a specific campaign listing by id. */
router.patch('/:campaignID', getCampaign, async (req, res) => {
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
router.delete('/:campaignID/:userID', getCampaign, getUser, async (req, res) => {
	try {
		// make sure user owns this campaign
		if (!res.user.campaignsOwned.find((campaignID) => campaignID == req.params.campaignID)) {
			return res.status(403).json({ message: "You do not own this campaign" }); // Forbidden
		}
		// make sure campaign is not published
		if (res.campaign.isPublished == true) {
			return res.status(428).json({ message: "Cannot delete a campaign that has already been published" }); // Precondition Required
		}
		// remove from owner
		await res.user.updateOne({ $pull: { campaignsOwned: res.campaign._id } }) // autosaves
		// delete campaign
		await res.campaign.remove();
		res.status(205).json({ message: 'Deleted Campaign' }); // Reset Content
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
})

/* DELETE ALL CAMPAIGNS. FOR DEBUGGING PURPOSES ONLY */
router.delete('/', async (req, res) => {
	try {
		await Campaign.deleteMany();
		const campaigns = await Campaign.find();
		res.json(campaigns);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
})

/* POST a new campaign! */
router.post('/', async (req, res) => {
	const b = req.body;
	const campaign = new Campaign({
		title: b.title,
		subtitle: b.subtitle,
		description: b.description,
		// mainImage: b.mainImage,
		isPublished: b.isPublished,
		owner: b.owner,
		goal: b.goal,
		duration: b.duration
	})
	try {
		// make sure owner exists
		const potentialOwner = await getUserByUsername(campaign.owner);
		if (potentialOwner == null) {
			return res.status(404).json({ message: "User not found" }); // Not Found
		}
		// owner exists, create campaign references
		const newCampaign = await campaign.save();
		potentialOwner.campaignsOwned.push(newCampaign._id);
		await potentialOwner.save();
		console.log(potentialOwner.campaignsOwned);
		res.status(201).json(newCampaign);
	} catch (error) {
		res.status(500).json(error);
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
		campaign = await Campaign.findById(req.params.campaignID);
		if (campaign == null) {
			return res.status(404).json({ message: 'Cannot find campaign' }); // Not Found
		}
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}

	res.campaign = campaign;
	next();
};

/**
 * This is a middleware function that is to be used whenever we expect a user ID from the client
 * We search the database for a user with the given id.
 * If something random goes wrong, return status 500
 * If we cannot find a matching user, return status 404
 */
async function getUser(req, res, next) {
	let user;
	try {
		user = await User.findById(req.params.userID);
		if (user == null) {
			return res.status(404).json({ message: 'Cannot find user' }); // Not Found
		}
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}

	res.user = user;
	next();
};

/**
 * This is a middleware function that is to be used whenever we expect a campaign ID from the client
 * We search the database for a campaign with the given id.
 * If something random goes wrong, return status 500
 * If we cannot find a matching campaign, return status 404
 */
async function getUserByUsername(username, res) {
	try {
		user = await User.findOne({ username: username });
		return user;
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

module.exports = router;
