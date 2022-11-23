const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    required: true
  },
  isPublished: {
    type: Boolean,
    required: true
  },
  dateCreated: {
    type: Date,
    required: true,
    default: Date.now
  },
  goalAmount: {
    type: Number,
    required: true
  },
  targetDuration: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Campaign', campaignSchema);