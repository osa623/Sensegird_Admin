const Article = require('../models/articleModel');

// Get all articles with optional status filtering
exports.getArticles = async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};
    
    // Filter by status if provided
    if (status && ['draft', 'published', 'archived'].includes(status)) {
      filter.status = status;
    }
    
    const articles = await Article.find(filter).sort({ date: -1 });
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get articles by status
exports.getArticlesByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
    // Validate status
    if (!['draft', 'published', 'archived'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be draft, published, or archived' });
    }
    
    const articles = await Article.find({ status }).sort({ date: -1 });
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single article by ID
exports.getArticleById = async (req, res) => {
  try {
    const article = await Article.findOne({ articleid: req.params.id });
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    res.status(200).json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new article
exports.createArticle = async (req, res) => {
  try {
    const article = new Article(req.body);
    const savedArticle = await article.save();
    res.status(201).json(savedArticle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update an article
exports.updateArticle = async (req, res) => {
  try {
    const article = await Article.findOneAndUpdate(
      { articleid: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    
    res.status(200).json(article);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update article status
exports.updateArticleStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    if (!['draft', 'published', 'archived'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be draft, published, or archived' });
    }
    
    const article = await Article.findOneAndUpdate(
      { articleid: req.params.id },
      { status },
      { new: true, runValidators: true }
    );
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    
    res.status(200).json(article);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an article
exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findOneAndDelete({ articleid: req.params.id });
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    
    res.status(200).json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
