const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  image: {
    data: Buffer,
    contentType: String,
    required: true
  }
});

module.exports = mongoose.model('Image', imageSchema);

/**
ID
Image
 */