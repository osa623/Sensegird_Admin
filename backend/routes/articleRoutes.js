const express = require('express');
const router = express.Router();
const Article = require('../models/articleModel');
const cors = require('cors');

// Configure CORS options - apply before defining routes
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests from your frontend origin
    // In development, this might be localhost:8081
    const allowedOrigins = ['http://localhost:8081', 'http://localhost:3000'];
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS middleware to the router
router.use(cors(corsOptions));

// Get all articles
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};
    
    // Filter by status if provided
    if (status && ['draft', 'published', 'archived'].includes(status)) {
      filter.status = status;
    }
    
    const articles = await Article.find(filter).sort({ date: -1 });
    res.json(articles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get articles by status
router.get('/status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    
    // Validate status
    if (!['draft', 'published', 'archived'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid status. Must be draft, published, or archived' });
    }
    
    const articles = await Article.find({ status }).sort({ date: -1 });
    res.json(articles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update article status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    if (!['draft', 'published', 'archived'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid status. Must be draft, published, or archived' });
    }
    
    // Find and update article status
    let article = await Article.findOne({ articleid: req.params.id });
    if (!article) return res.status(404).json({ msg: 'Article not found' });
    
    article = await Article.findOneAndUpdate(
      { articleid: req.params.id },
      { $set: { status } },
      { new: true }
    );
    
    res.json(article);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get article by ID
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findOne({ articleid: req.params.id });
    if (!article) return res.status(404).json({ msg: 'Article not found' });
    res.json(article);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Create new article (protected route)
router.post('/', async (req, res) => {
  try {
    const {
      articleid,
      title,
      subtitle,
      images,
      status,
      subtopics,
      subcontent,
      author,
      designation,
      keywords
    } = req.body;
    
    // Check if article with same ID already exists
    let article = await Article.findOne({ articleid });
    if (article) {
      return res.status(400).json({ msg: 'Article with this ID already exists' });
    }
    
    // Create new article instance
    article = new Article({
      articleid,
      title,
      subtitle,
      images,
      status,
      subtopics,
      subcontent,
      author,
      designation,
      keywords
    });
    
    await article.save();
    res.json(article);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update article (protected route)
router.put('/:id',  async (req, res) => {
  try {
    const {
      title,
      subtitle,
      images,
      status,
      subtopics,
      subcontent,
      author,
      designation,
      keywords
    } = req.body;
    
    // Build article object with updated fields
    const articleFields = {};
    if (title) articleFields.title = title;
    if (subtitle) articleFields.subtitle = subtitle;
    if (images) articleFields.images = images;
    if (status) articleFields.status = status;
    if (subtopics) articleFields.subtopics = subtopics;
    if (subcontent) articleFields.subcontent = subcontent;
    if (author) articleFields.author = author;
    if (designation) articleFields.designation = designation;
    if (keywords) articleFields.keywords = keywords;
    
    // Find and update article
    let article = await Article.findOne({ articleid: req.params.id });
    if (!article) return res.status(404).json({ msg: 'Article not found' });
    
    article = await Article.findOneAndUpdate(
      { articleid: req.params.id },
      { $set: articleFields },
      { new: true }
    );
    
    res.json(article);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete article (protected route)
router.delete('/:id', async (req, res) => {
  try {
    // Find article by ID
    let article = await Article.findOne({ articleid: req.params.id });
    if (!article) return res.status(404).json({ msg: 'Article not found' });
    
    // Delete article using a supported method
    await Article.findOneAndDelete({ articleid: req.params.id });
    
    console.log(`Successfully deleted article with ID: ${req.params.id}`);
    res.json({ msg: 'Article removed', success: true });
  } catch (err) {
    console.error('Error deleting article:', err.message);
    console.error('Error stack:', err.stack);
    res.status(500).json({ 
      msg: 'Server Error',
      error: err.message,
      success: false
    });
  }
});

// Alternative route for article deletion
router.post('/remove', async (req, res) => {
  try {
    const { articleId } = req.body;
    if (!articleId) {
      return res.status(400).json({ msg: 'Article ID is required' });
    }
    
    // Find article by ID
    let article = await Article.findOne({ articleid: articleId });
    if (!article) return res.status(404).json({ msg: 'Article not found' });
    
    // Delete the article
    await article.deleteOne();
    
    console.log(`Successfully deleted article with ID: ${articleId} using alternative method`);
    res.json({ msg: 'Article removed using alternative method', success: true });
  } catch (err) {
    console.error('Error in alternative delete route:', err.message);
    res.status(500).json({
      msg: 'Server Error',
      error: err.message,
      success: false
    });
  }
});

module.exports = router;
