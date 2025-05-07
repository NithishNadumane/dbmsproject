const express = require('express');
const router = express.Router();
const pool = require('../db');

// Simple scoring logic with polite messages
function calculateCarbonScore(answers) {
  let score = 100;

  const scoreMap = {
    electricity: { Low: -10, Medium: 0, High: 10 },
    vehicle: { Bicycle: -15, Public: -5, Electric: 0, Gasoline: 10 },
    flights: { Never: -10, '1-2': 0, '3-5': 10, 'More than 5': 20 },
    diet: { Vegan: -10, Vegetarian: -5, Balanced: 0, 'Non-Vegetarian': 10 },
    foodWaste: { None: -5, Small: 0, Moderate: 5, Large: 10 },
    heating: {
      'Electric (renewable)': -5,
      Other: 0,
      Gas: 5,
      'Electric (non-renewable)': 10,
    },
    waterConservation: { Always: -10, Sometimes: 0, Rarely: 5, Never: 10 },
    recycling: { Yes: -10, Sometimes: 0, No: 10 },
    ecoFriendly: { Always: -5, Sometimes: 0, Rarely: 5, Never: 10 },
    greenActivities: {
      'Yes, regularly': -10,
      'Yes, occasionally': 0,
      No: 10,
    },
  };

  for (const key in answers) {
    const value = answers[key];
    score += scoreMap[key]?.[value] ?? 0;
  }

  // Ensure score doesn't exceed 100
  score = Math.min(score, 100); // Caps the score at 100

  // Generate polite message based on the score
  let message = '';
  if (score > 80) {
    message = 'It looks like your carbon footprint is a bit on the higher side. There are many small changes you can make to reduce it, and every step counts!';
  } else if (score >= 50) {
    message = 'You\'re doing well, but there\'s still a chance to reduce your environmental impact a little more. Keep up the great work, and try to make a few adjustments where possible.';
  } else {
    message = 'Great job! Your carbon footprint is impressively low. With a few more small changes, you could make an even bigger difference.';
  }

  return { score, message }; // Return both the score and the message
}

router.post('/carbon', async (req, res) => {
  const userEmail = req.body.email;

  if (!userEmail) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  const answers = req.body.answers;

  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ success: false, message: 'Invalid data' });
  }

  const { score, message } = calculateCarbonScore(answers);

  try {
    await pool.query(
      'INSERT INTO carbon_insights (email, answers, score) VALUES ($1, $2, $3)',
      [userEmail, answers, score]
    );

    res.json({ success: true, score, message });
  } catch (err) {
    console.error('DB Error:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

module.exports = router;
