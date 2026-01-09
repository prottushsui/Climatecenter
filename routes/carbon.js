const express = require('express');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const { CARBON_EMISSION_FACTORS } = require('../utils/constants');
require('dotenv').config();

const router = express.Router();

// Get user's carbon entries
router.get('/entries', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM carbon_entries WHERE user_id = $1 ORDER BY date DESC',
      [req.user.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get carbon entries error:', error);
    res.status(500).json({ message: 'Server error fetching carbon entries' });
  }
});

// Add a new carbon entry
router.post('/entries', authenticateToken, async (req, res) => {
  try {
    const { category, value, date } = req.body;

    // Calculate emissions based on category (simplified calculation)
    let calculated_emissions = 0;
    switch (category) {
      case 'transport':
        calculated_emissions = value * CARBON_EMISSION_FACTORS.transport;
        break;
      case 'food':
        calculated_emissions = value * CARBON_EMISSION_FACTORS.food;
        break;
      case 'energy':
        calculated_emissions = value * CARBON_EMISSION_FACTORS.energy;
        break;
      default:
        calculated_emissions = value;
    }

    const result = await query(
      'INSERT INTO carbon_entries (user_id, category, value, calculated_emissions, date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.userId, category, value, calculated_emissions, date || new Date()]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add carbon entry error:', error);
    res.status(500).json({ message: 'Server error adding carbon entry' });
  }
});

// Update a carbon entry
router.put('/entries/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { category, value, date } = req.body;

    // Calculate emissions based on category (simplified calculation)
    let calculated_emissions = 0;
    switch (category) {
      case 'transport':
        calculated_emissions = value * CARBON_EMISSION_FACTORS.transport;
        break;
      case 'food':
        calculated_emissions = value * CARBON_EMISSION_FACTORS.food;
        break;
      case 'energy':
        calculated_emissions = value * CARBON_EMISSION_FACTORS.energy;
        break;
      default:
        calculated_emissions = value;
    }

    const result = await query(
      'UPDATE carbon_entries SET category = $1, value = $2, calculated_emissions = $3, date = $4 WHERE id = $5 AND user_id = $6 RETURNING *',
      [category, value, calculated_emissions, date, id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Carbon entry not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update carbon entry error:', error);
    res.status(500).json({ message: 'Server error updating carbon entry' });
  }
});

// Delete a carbon entry
router.delete('/entries/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM carbon_entries WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Carbon entry not found' });
    }

    res.json({ message: 'Carbon entry deleted successfully' });
  } catch (error) {
    console.error('Delete carbon entry error:', error);
    res.status(500).json({ message: 'Server error deleting carbon entry' });
  }
});

// Get user's carbon analytics summary
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    // Get total emissions by category
    const totalByCategory = await query(
      'SELECT category, SUM(calculated_emissions) as total_emissions FROM carbon_entries WHERE user_id = $1 GROUP BY category',
      [req.user.userId]
    );

    // Get monthly emissions for the last 6 months
    const monthlyEmissions = await query(
      `SELECT 
        DATE_TRUNC('month', date) as month,
        SUM(calculated_emissions) as total_emissions
       FROM carbon_entries 
       WHERE user_id = $1 
         AND date >= CURRENT_DATE - INTERVAL '6 months'
       GROUP BY DATE_TRUNC('month', date)
       ORDER BY month`,
      [req.user.userId]
    );

    // Get total carbon footprint
    const totalFootprint = await query(
      'SELECT SUM(calculated_emissions) as total FROM carbon_entries WHERE user_id = $1',
      [req.user.userId]
    );

    res.json({
      total_by_category: totalByCategory.rows,
      monthly_emissions: monthlyEmissions.rows,
      total_footprint: totalFootprint.rows[0]?.total || 0
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
});

module.exports = router;