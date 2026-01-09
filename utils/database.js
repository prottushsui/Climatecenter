const { query } = require('../config/db');

// Common database utility functions

// Get user by ID
const getUserById = async (userId) => {
  const result = await query(
    'SELECT id, email, name, role, created_at FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0];
};

// Get post by ID with author information
const getPostWithAuthor = async (postId) => {
  const result = await query(
    `SELECT p.*, u.name as author_name, u.role as author_role 
     FROM posts p 
     JOIN users u ON p.user_id = u.id 
     WHERE p.id = $1`,
    [postId]
  );
  return result.rows[0];
};

// Get comments for a post with author information
const getCommentsForPost = async (postId) => {
  const result = await query(
    `SELECT c.*, u.name as author_name, u.role as author_role
     FROM comments c
     JOIN users u ON c.user_id = u.id
     WHERE c.post_id = $1
     ORDER BY c.created_at ASC`,
    [postId]
  );
  return result.rows;
};

// Get vote count for a post
const getPostVoteCount = async (postId) => {
  const result = await query(
    `SELECT 
      SUM(CASE WHEN vote_type = 'up' THEN 1 ELSE 0 END) - 
      SUM(CASE WHEN vote_type = 'down' THEN 1 ELSE 0 END) AS vote_score
     FROM votes 
     WHERE post_id = $1`,
    [postId]
  );
  return result.rows[0]?.vote_score || 0;
};

// Check if user is authorized to modify a post
const isUserAuthorizedForPost = async (userId, postId) => {
  const result = await query(
    'SELECT user_id, (SELECT role FROM users WHERE id = posts.user_id) as role FROM posts WHERE id = $1',
    [postId]
  );
  
  if (result.rows.length === 0) {
    return { authorized: false, reason: 'Post not found' };
  }
  
  const post = result.rows[0];
  const isAuthor = post.user_id === userId;
  const isAdmin = post.role === 'admin';
  
  return { 
    authorized: isAuthor || isAdmin,
    isAuthor,
    isAdmin
  };
};

// Check if user is authorized to modify a comment
const isUserAuthorizedForComment = async (userId, commentId) => {
  const result = await query(
    'SELECT user_id, post_id, (SELECT role FROM users WHERE id = comments.user_id) as role FROM comments WHERE id = $1',
    [commentId]
  );
  
  if (result.rows.length === 0) {
    return { authorized: false, reason: 'Comment not found' };
  }
  
  const comment = result.rows[0];
  const isAuthor = comment.user_id === userId;
  
  let isAdmin = false;
  if (!isAuthor) {
    const postResult = await query(
      'SELECT (SELECT role FROM users WHERE id = posts.user_id) as role FROM posts WHERE id = $1',
      [comment.post_id]
    );
    isAdmin = postResult.rows[0]?.role === 'admin';
  }
  
  return { 
    authorized: isAuthor || isAdmin,
    isAuthor,
    isAdmin
  };
};

module.exports = {
  getUserById,
  getPostWithAuthor,
  getCommentsForPost,
  getPostVoteCount,
  isUserAuthorizedForPost,
  isUserAuthorizedForComment
};