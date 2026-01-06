const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const router = express.Router();

// PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'climate_platform',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'climate_secret_key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// Get all posts (with optional category filter)
router.get('/posts', async (req, res) => {
  try {
    const { category, limit = 20, offset = 0 } = req.query;
    
    let query = 'SELECT p.*, u.name as author_name FROM posts p JOIN users u ON p.user_id = u.id';
    const params = [];
    let paramIndex = 1;
    
    if (category) {
      query += ` WHERE p.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    
    query += ' ORDER BY p.created_at DESC LIMIT $' + paramIndex + ' OFFSET $' + (paramIndex + 1);
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await pool.query(query, params);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error fetching posts' });
  }
});

// Get a specific post with comments
router.get('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the post
    const postResult = await pool.query(
      `SELECT p.*, u.name as author_name, u.role as author_role 
       FROM posts p 
       JOIN users u ON p.user_id = u.id 
       WHERE p.id = $1`,
      [id]
    );
    
    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const post = postResult.rows[0];
    
    // Get comments for the post
    const commentsResult = await pool.query(
      `SELECT c.*, u.name as author_name, u.role as author_role
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = $1
       ORDER BY c.created_at ASC`,
      [id]
    );
    
    post.comments = commentsResult.rows;
    
    res.json(post);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error fetching post' });
  }
});

// Create a new post
router.post('/posts', authenticateToken, async (req, res) => {
  try {
    const { title, content, category } = req.body;
    
    const result = await pool.query(
      'INSERT INTO posts (user_id, title, content, category, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.userId, title, content, category, new Date()]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error creating post' });
  }
});

// Update a post (only if user is the author or admin)
router.put('/posts/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category } = req.body;
    
    // Check if user is the author or admin
    const postResult = await pool.query(
      'SELECT user_id, (SELECT role FROM users WHERE id = posts.user_id) as role FROM posts WHERE id = $1',
      [id]
    );
    
    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const post = postResult.rows[0];
    const isAuthor = post.user_id === req.user.userId;
    const isAdmin = post.role === 'admin';
    
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }
    
    const result = await pool.query(
      'UPDATE posts SET title = $1, content = $2, category = $3 WHERE id = $4 RETURNING *',
      [title, content, category, id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Server error updating post' });
  }
});

// Delete a post (only if user is the author or admin)
router.delete('/posts/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is the author or admin
    const postResult = await pool.query(
      'SELECT user_id, (SELECT role FROM users WHERE id = posts.user_id) as role FROM posts WHERE id = $1',
      [id]
    );
    
    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const post = postResult.rows[0];
    const isAuthor = post.user_id === req.user.userId;
    const isAdmin = post.role === 'admin';
    
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }
    
    await pool.query('DELETE FROM comments WHERE post_id = $1', [id]);
    await pool.query('DELETE FROM posts WHERE id = $1', [id]);
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error deleting post' });
  }
});

// Add a comment to a post
router.post('/comments', authenticateToken, async (req, res) => {
  try {
    const { post_id, content } = req.body;
    
    // Verify the post exists
    const postResult = await pool.query(
      'SELECT id FROM posts WHERE id = $1',
      [post_id]
    );
    
    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const result = await pool.query(
      'INSERT INTO comments (user_id, post_id, content, created_at) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.userId, post_id, content, new Date()]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error adding comment' });
  }
});

// Update a comment (only if user is the author or admin)
router.put('/comments/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    // Check if user is the author or admin
    const commentResult = await pool.query(
      'SELECT user_id, post_id, (SELECT role FROM users WHERE id = comments.user_id) as role FROM comments WHERE id = $1',
      [id]
    );
    
    if (commentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    const comment = commentResult.rows[0];
    const isAuthor = comment.user_id === req.user.userId;
    
    // Check if user is admin of the post's author
    let isAdmin = false;
    if (!isAuthor) {
      const postResult = await pool.query(
        'SELECT (SELECT role FROM users WHERE id = posts.user_id) as role FROM posts WHERE id = $1',
        [comment.post_id]
      );
      isAdmin = postResult.rows[0]?.role === 'admin';
    }
    
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this comment' });
    }
    
    const result = await pool.query(
      'UPDATE comments SET content = $1 WHERE id = $2 RETURNING *',
      [content, id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ message: 'Server error updating comment' });
  }
});

// Delete a comment (only if user is the author or admin)
router.delete('/comments/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is the author or admin
    const commentResult = await pool.query(
      'SELECT user_id, post_id, (SELECT role FROM users WHERE id = comments.user_id) as role FROM comments WHERE id = $1',
      [id]
    );
    
    if (commentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    const comment = commentResult.rows[0];
    const isAuthor = comment.user_id === req.user.userId;
    
    // Check if user is admin of the post's author
    let isAdmin = false;
    if (!isAuthor) {
      const postResult = await pool.query(
        'SELECT (SELECT role FROM users WHERE id = posts.user_id) as role FROM posts WHERE id = $1',
        [comment.post_id]
      );
      isAdmin = postResult.rows[0]?.role === 'admin';
    }
    
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }
    
    await pool.query('DELETE FROM comments WHERE id = $1', [id]);
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error deleting comment' });
  }
});

// Vote on a post
router.post('/votes', authenticateToken, async (req, res) => {
  try {
    const { post_id, vote_type } = req.body; // vote_type: 'up' or 'down'
    
    if (vote_type !== 'up' && vote_type !== 'down') {
      return res.status(400).json({ message: 'Invalid vote type. Use "up" or "down".' });
    }
    
    // Verify the post exists
    const postResult = await pool.query(
      'SELECT id FROM posts WHERE id = $1',
      [post_id]
    );
    
    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user already voted
    const existingVote = await pool.query(
      'SELECT id FROM votes WHERE user_id = $1 AND post_id = $2',
      [req.user.userId, post_id]
    );
    
    if (existingVote.rows.length > 0) {
      // Update existing vote
      await pool.query(
        'UPDATE votes SET vote_type = $1 WHERE user_id = $2 AND post_id = $3',
        [vote_type, req.user.userId, post_id]
      );
    } else {
      // Create new vote
      await pool.query(
        'INSERT INTO votes (user_id, post_id, vote_type, created_at) VALUES ($1, $2, $3, $4)',
        [req.user.userId, post_id, vote_type, new Date()]
      );
    }
    
    // Calculate new vote count
    const voteCount = await pool.query(
      `SELECT 
        SUM(CASE WHEN vote_type = 'up' THEN 1 ELSE 0 END) - 
        SUM(CASE WHEN vote_type = 'down' THEN 1 ELSE 0 END) AS vote_score
       FROM votes 
       WHERE post_id = $1`,
      [post_id]
    );
    
    res.json({ 
      message: 'Vote recorded successfully',
      vote_score: voteCount.rows[0]?.vote_score || 0
    });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ message: 'Server error recording vote' });
  }
});

module.exports = router;