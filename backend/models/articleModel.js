const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  articleid: {
    type: String,
    required: true,
    unique: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  title: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
    index: true
  },
  subtitle: {
    type: String,
    required: true
  },
  images: {
    type: [String],
    default: []
  },
  subtopics: {
    type: [String],
    default: []
  },
  subcontent: {
    type: [String],
    default: []
  },
  author: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    required: true
  },
  keywords: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

// Add compound index for better query performance
articleSchema.index({ status: 1, date: -1 });

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
