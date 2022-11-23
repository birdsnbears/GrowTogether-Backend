var express = require('express');
var router = express.Router();
const Campaign = require('../models/campaign');

/* GET users listing. */
router.get('/', function (req, res, next) {
	res.send('DEATH TO ALL.');
});

router.get('/test', async (req, res) => {
	try {
		const campaigns = await Campaign.find();
		res.json(campaigns);
	} catch (error) {
		console.error(error.message);
		res.status(500).json({ message: error.message });
	}
})

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
})

module.exports = router;
