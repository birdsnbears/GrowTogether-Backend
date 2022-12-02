var express = require('express');
var router = express.Router();
const User = require('../models/user');
const Campaign = require('../models/campaign');

// This get doesn't really do anything, but i'm just returning a json like everything else expects instead of html
router.get('/', async (req, res) => {
  const users = await User.find() // for debugging only
  res.json(users); // for debugging only
  // res.status(404).json({ message: "/users does not exist! Try providing a user ID!" }); // Not Found
});

/* DELETE ALL USERS. FOR DEBUGGING PURPOSES ONLY */
router.delete('/', async (req, res) => {
  try {
    await User.deleteMany();
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
})

/* Sign Up */
router.post('/', async (req, res) => {
  // check for correct params
  if (!req.body.firstName || !req.body.lastName || !req.body.username || !req.body.password) {
    return res.status(422).json({ message: "Missing necessary account information" }); // Unprocessable Entity
  }

  // check for duplicate username
  let potentialUser = await User.findOne({ username: req.body.username })
  if (potentialUser != null) {
    return res.status(409).json({ message: "Username is already taken" }); // Conflict
  }

  // no errors, make user:
  const body = req.body;
  const user = new User({
    firstName: body.firstName,
    lastName: body.lastName,
    username: body.username,
    password: body.password
  })

  try {
    const newUser = await user.save();
    res.status(201).json({ userID: newUser._id }); // Created
  } catch (error) {
    res.status(500).json(error);
  }
});

/* Log In */
router.get('/Login', async function (req, res) {
  let user;
  try {
    // find user with username/password. If either is missing, user will be null.
    user = await User.findOne({
      username: req.body.username,
      password: req.body.password
    });
    if (user == null) {
      // username and password is wrong
      return res.status(401).json({ message: 'Invalid Credentials' }); // Unauthorized
    }
    // found corresponding account
    return res.status(205).json({ userID: user._id }); // Reset Content

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* Account Overview */
router.get('/:userID', getUser, function (req, res) {
  // middleware found the user.
  return res.status(200).json(res.user); // OK
});

/* Saving Account Settings */
router.patch('/:userID', getUser, async (req, res) => {
  // middleware found the user
  try {
    // if they wanted to change username, make sure it's not already taken
    if (req.body.username) {
      const potentialUser = await User.findOne({ username: req.body.username });
      if (potentialUser && potentialUser._id != req.params.userID) {
        return res.status(409).json({ message: "Username is already taken" }); // Conflict
      }
    }

    // update with given user settings
    let updatedKeys = Object.keys(req.body);
    updatedKeys.forEach(async key => {
      // if they updated their username, update the owner value on all of their owned campaigns
      if (key == "username" && res.user.username != req.body.username) {
        res.user.populate('campaignsOwned');
        const campaigns = res.user.campaignsOwned;
        campaigns.forEach(async campaign => {
          campaign.owner = req.body.username;
          await campaign.save();
        })
      }
      // only allow changes to values found in Account Settings
      if ((key == "firstName" || key == "lastName" || key == "username" || key == "password") && req.body[key]) {
        res.user[key] = req.body[key];
      }
    });

    const updateduser = await res.user.save();
    return res.status(205).json(updateduser); // Reset Content
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
})

/* Deleting Account in Account Settings
*  Needs to make sure the account has yet to make a donation or owns a campaign that is published.
*/
router.delete('/:userID', getUser, async (req, res) => {
  // middleware found user

  try {
    // check donations
    if (res.user.donations.length > 0) {
      return res.status(428).json({ message: "Cannot delete account with donations" }); // Precondition Required
    }

    // check published campaigns
    await res.user.populate('campaignsOwned');
    const campaigns = res.user.campaignsOwned;
    for (let i = 0; i < campaigns.length; i++) {
      const campaign = campaigns[i];
      if (campaign.isPublished == true) {
        return res.status(428).json({ message: "Cannot delete account with a published Campaign" }); // Precondition Required
      }
    }
    // preconditions checked, start deletion.

    // delete all unpublished campaigns
    const promises = [];
    campaigns.forEach(async campaign => promises.push(campaign.remove()));
    // delete user
    promises.push(res.user.remove());
    await Promise.all(promises);
    return res.status(205).json({ message: 'Deleted user' }); // Reset Content
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
})

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
async function getCampaign(req, res, next) {
  let campaign;
  try {
    campaign = await Campaign.findById(req.params.campaignID);
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
