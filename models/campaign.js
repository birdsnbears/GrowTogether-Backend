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
  description: {
    type: String,
    required: true
  },
  mainImage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image',
    required: false // will be true, must upload default image though
  },
  isPublished: {
    type: Boolean,
    required: true,
    default: false
  },
  owner: {
    type: String,
    required: true
  },
  goal: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  publishDate: {
    type: Date,
    required: false
  },
  viewsByDate: [{
    date: Date,
    viewCount: Number
  }],
  content: [{
    type: String,
    content: String
  }],
  rewards: [{
    name: String,
    price: Number,
    description: String,
    expectedDeliveryDate: Date
  }]
});

module.exports = mongoose.model('Campaign', campaignSchema);

/**
ID
Title
Subtitle
Description
Main Image
IsPublished
Owner
Goal
Duration
Publish Date
ViewsByDate: [{}]
  Date
  ViewCount
Content: [{}]
  Type: string
  Content: string
    If the string is an image, it contains the object id of the image
Rewards: [{}]
  Name
  Price
  Description
  ExpectedDeliveryDate
 */