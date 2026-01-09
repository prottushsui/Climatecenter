const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { query } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const { HTTP_STATUS } = require('../utils/constants');
require('dotenv').config();

const router = express.Router();

// Get all news articles
router.get('/articles', async (req, res) => {
  try {
    const { category, limit = 20, offset = 0 } = req.query;
    
    let queryStr = 'SELECT * FROM news_articles';
    const params = [];
    let paramIndex = 1;
    
    if (category) {
      queryStr += ` WHERE category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    
    queryStr += ' ORDER BY published_at DESC LIMIT $' + paramIndex + ' OFFSET $' + (paramIndex + 1);
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await query(queryStr, params);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get news articles error:', error);
    res.status(500).json({ message: 'Server error fetching news articles' });
  }
});

// Get a specific news article
router.get('/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM news_articles WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'News article not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get news article error:', error);
    res.status(500).json({ message: 'Server error fetching news article' });
  }
});

// Bookmark a news article
router.post('/bookmarks', authenticateToken, async (req, res) => {
  try {
    const { article_id } = req.body;
    
    // Verify the article exists
    const articleResult = await pool.query(
      'SELECT id FROM news_articles WHERE id = $1',
      [article_id]
    );
    
    if (articleResult.rows.length === 0) {
      return res.status(404).json({ message: 'News article not found' });
    }
    
    const result = await pool.query(
      'INSERT INTO bookmarks (user_id, article_id, created_at) VALUES ($1, $2, $3) RETURNING *',
      [req.user.userId, article_id, new Date()]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Bookmark news article error:', error);
    res.status(500).json({ message: 'Server error bookmarking news article' });
  }
});

// Get user's bookmarks
router.get('/bookmarks', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, na.title, na.source, na.url, na.published_at 
       FROM bookmarks b
       JOIN news_articles na ON b.article_id = na.id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [req.user.userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({ message: 'Server error fetching bookmarks' });
  }
});

// Remove a bookmark
router.delete('/bookmarks/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM bookmarks WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Bookmark not found' });
    }
    
    res.json({ message: 'Bookmark removed successfully' });
  } catch (error) {
    console.error('Remove bookmark error:', error);
    res.status(500).json({ message: 'Server error removing bookmark' });
  }
});

// Fetch and store recent climate news (for admin/automated use)
router.post('/fetch-news', async (req, res) => {
  try {
    // In a real application, you would use a proper news API like NewsAPI
    // For this example, we'll simulate with mock data
    const mockNews = [
      {
        title: "Global Temperatures Reach Record High",
        summary: "Scientists report unprecedented global warming trends",
        url: "https://example.com/news1",
        source: "Climate News Network",
        category: "climate-science",
        published_at: new Date()
      },
      {
        title: "Renewable Energy Investments Surge",
        summary: "Solar and wind power investments exceed fossil fuels",
        url: "https://example.com/news2",
        source: "Green Energy Today",
        category: "renewable-energy",
        published_at: new Date()
      },
      {
        title: "New Carbon Capture Technology Breakthrough",
        summary: "Innovative method shows promise for reducing emissions",
        url: "https://example.com/news3",
        source: "Environmental Tech",
        category: "technology",
        published_at: new Date()
      }
    ];
    
    // Insert mock news into database (in real app, use API)
    for (const article of mockNews) {
      // Check if article already exists to avoid duplicates
      const existing = await pool.query(
        'SELECT id FROM news_articles WHERE url = $1',
        [article.url]
      );
      
      if (existing.rows.length === 0) {
        await pool.query(
          'INSERT INTO news_articles (title, summary, url, source, category, published_at) VALUES ($1, $2, $3, $4, $5, $6)',
          [article.title, article.summary, article.url, article.source, article.category, article.published_at]
        );
      }
    }
    
    res.json({ message: 'News articles fetched and stored successfully', count: mockNews.length });
  } catch (error) {
    console.error('Fetch news error:', error);
    res.status(500).json({ message: 'Server error fetching news' });
  }
});

module.exports = router;