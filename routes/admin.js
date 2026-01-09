const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { query } = require('../config/db');
const router = express.Router();

// Get admin dashboard stats
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get total users count
    const totalUsersResult = await query('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(totalUsersResult.rows[0].count);

    // Get active users today
    const today = new Date().toISOString().split('T')[0];
    const activeTodayResult = await query(`
      SELECT COUNT(DISTINCT user_id) as count 
      FROM carbon_entries 
      WHERE DATE(date) = $1
    `, [today]);
    const activeToday = parseInt(activeTodayResult.rows[0].count);

    // Get total posts count
    const totalPostsResult = await query('SELECT COUNT(*) as count FROM posts');
    const totalPosts = parseInt(totalPostsResult.rows[0].count);

    res.json({
      totalUsers,
      activeToday,
      totalPosts
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Server error while fetching stats' });
  }
});

// Get all users
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await query(`
      SELECT id, email, name, role, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    
    res.json({
      users: result.rows
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

// Update user role
router.put('/users/:userId/role', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ['user', 'moderator', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const result = await query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, name, role, created_at',
      [role, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User role updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Server error while updating user role' });
  }
});

// Delete user
router.delete('/users/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await query('DELETE FROM users WHERE id = $1', [userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
});

// Get all reports for moderation
router.get('/reports', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await query(`
      SELECT r.id, r.reason, r.status, 
             r.created_at,
             reporter.name as reporter_name,
             reported.name as reported_name,
             p.title as post_title
      FROM reports r
      LEFT JOIN users reporter ON r.reporter_user_id = reporter.id
      LEFT JOIN users reported ON r.reported_user_id = reported.id
      LEFT JOIN posts p ON r.post_id = p.id
      ORDER BY r.created_at DESC
    `);
    
    res.json({
      reports: result.rows
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Server error while fetching reports' });
  }
});

// Update report status
router.put('/reports/:reportId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'reviewed', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const result = await query(
      'UPDATE reports SET status = $1 WHERE id = $2 RETURNING *',
      [status, reportId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json({
      message: 'Report status updated successfully',
      report: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({ message: 'Server error while updating report status' });
  }
});

module.exports = router;