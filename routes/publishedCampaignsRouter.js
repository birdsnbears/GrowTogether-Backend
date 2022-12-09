var express = require("express");
var router = express.Router();
// const UnpublishedCampaign = require("../models/unpublishedCampaign");
const PublishedCampaign = require("../models/publishedCampaign");
const User = require("../models/user");
const Image = require("../models/image");
const { isValidObjectId } = require("mongoose");

/***** FOR OVERVIEW *****/
// gather information for the public campaign
router.get("/overview/:campaignID/:userID", getCampaign, getUser, async (req, res) => {
  // get all donations for this campaign
  // I think that's about it. The client will organize that shit.
  // may no longer be necessary with the new donations router
});

/***** FOR SETTINGS *****/

/* Edit Published Settings */
router.patch("/settings/:campaignID/:userID", getCampaign, getUser, async (req, res) => {
  const b = req.body;
  try {
    // verify the given information is correct
    if (b.mainImage && !isValidObjectId(b.mainImage)) {
      const potentialImage = await Image.findById(b.mainImage);
      if (potentialImage.length <= 0) {
        return res.status(404).json({ message: "Image not found" }); // Not Found
      }
    }
    // update unpublished campaign
    const c = res.campaign;
    c.title = b.title;
    c.subtitle = b.subtitle;
    c.description = b.description;
    if (b.mainImage) {
      c.mainImage = b.mainImage;
    }

    // respond with new data
    const updatedPC = await c.save();
    return res.json(updatedPC);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/***** FOR EDIT CONTENT *****/

/* Edit Published Content */
router.patch("/content/:campaignID/:userID", getCampaign, getUser, async (req, res) => {
  const b = req.body;
  try {
    // verify the given information is correct
    const contents = b.content;
    for (let i = 0; i < contents.length; i++) {
      const section = contents[i];
      if (!ValidContentTypes[section.type]) {
        // there is a content here that does not conform to our accepted Content Types.
        return res.status(428).json({ message: "Invalid Content Type" }); // Precondition Required
      }
      if (!section.content) {
        return res.status(428).json({ message: "Every piece of content must have something to display." }); // Precondition Required
      }
    }
    // seems good to me.
    res.campaign.content = contents;
    const updatedPC = await res.campaign.save();
    return res.json(updatedPC);
  } catch {
    res.status(500).json({ message: error.message });
  }
});

/*********************** FOR DEBUGGING ********************************/

/* GET all campaigns. FOR DEBUGGING PURPOSES ONLY */
// currently it returns all the campaigns in the campaign db.
router.get("/", async (req, res) => {
  try {
    // Campaign.deleteMany();
    const campaigns = await PublishedCampaign.find();
    res.json(campaigns);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: error.message });
  }
});

/* GET a specific campaign listing by id. FOR DEBUGGING PURPOSES ONLY */
router.get("/:campaignID", getCampaign, function (req, res) {
  res.json(res.campaign);
});

/* PATCH Campaign. FOR DEBUG PURPOSES ONLY. THIS DOES NOT DO ANY DATA VALIDATION*/
router.patch("/:campaignID", getCampaign, async (req, res) => {
  // update the given campaign information
  let updatedKeys = Object.keys(req.body);
  updatedKeys.forEach((key) => {
    res.campaign[key] = req.body[key];
  });

  try {
    const updatedCampaign = await res.campaign.save();
    res.json(updatedCampaign);
  } catch (error) {
    res.status(400).json({ message: error.message });
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
    campaign = await PublishedCampaign.findById(req.params.campaignID);
    if (campaign == null) {
      return res.status(404).json({ message: "Cannot find campaign" }); // Not Found
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }

  res.campaign = campaign;
  next();
}

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
      return res.status(404).json({ message: "Cannot find user" }); // Not Found
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }

  res.user = user;
  next();
}

module.exports = router;

const ValidContentTypes = {
  Header: true,
  Paragraph: true,
  Image: true,
  Video: true,
};
