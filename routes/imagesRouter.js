var express = require('express');
var fs = require('fs');
var router = express.Router();
const Image = require('../models/image');

/* GET ALL Images (FOR DEBUG ONLY) */
router.get('/', async function (req, res, next) {
  await createDefaultIfEmpty();
  const result = await Image.find();
  res.json(result);
});

/* GET Image */
router.get('/:imageID', function (req, res, next) {
  res.send('respond with a resource');
});

async function createDefaultIfEmpty() {
  const dbContents = await Image.find();
  if (dbContents.length == 0) {
    var a = new Image;
    a.content.data = fs.readFileSync(__dirname + "/../public/images/DefaultCampaign.png");
    a.content.contentType = 'image/png';
    await a.save();
  }
}

/**
 * This is a middleware function that is to be used whenever we expect a image ID from the client
 * We search the database for a image with the given id.
 * If something random goes wrong, return status 500
 * If we cannot find a matching image, return status 404
 */
async function getImage(req, res, next) {
  let image;
  try {
    image = await Image.findById(req.params.imageID);
    if (image == null) {
      return res.status(404).json({ message: 'Cannot find image' }); // Not Found
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }

  res.image = image;
  next();
};

module.exports = router;
