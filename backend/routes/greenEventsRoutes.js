const express = require("express");
const router = express.Router();
const pool = require("../db");

// ✅ Get all upcoming approved events
router.get("/upcoming", async (req, res) => {
  try {
    const result = await pool.query(`
        SELECT * FROM events
        WHERE approved = TRUE AND date >= CURRENT_DATE
        ORDER BY date ASC
      `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching upcoming events:", err);
    res.status(500).json({ error: "Failed to load events." });
  }
});

// ✅ Get event participation history for a user
router.get("/history", async (req, res) => {
  const email = req.query.email;

  if (!email) {
    return res.status(400).json({ error: "User email is required" });
  }

  try {
    const result = await pool.query(`
        SELECT e.title, e.date, ep.joined_at
        FROM event_participants ep
        JOIN events e ON ep.event_id = e.id
        WHERE ep.user_email = $1
        ORDER BY ep.joined_at DESC
      `, [email]);

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching participation history:", err);
    res.status(500).json({ error: "Failed to fetch history." });
  }
});

// ✅ Join an event
// Join an event
router.post("/join", async (req, res) => {
  const { eventId, email } = req.body;

  if (!eventId || !email) {
    return res.status(400).json({ error: "Missing eventId or email" });
  }

  try {
    const query = `
        INSERT INTO event_participants (event_id, user_email)
        VALUES ($1, $2)
        RETURNING *;
      `;
    const values = [eventId, email];
    const result = await pool.query(query, values);

    res.status(201).json({ message: "Joined event", data: result.rows[0] });
  } catch (err) {
    console.error("Error inserting into event_participants:", err);
    res.status(500).json({ error: "Database error" });
  }
});


// Suggest a new event
router.post("/suggest", async (req, res) => {
  try {
    const {
      title,
      organizer,
      date,
      location,
      event_type,
      description,
      created_by
    } = req.body;

    const result = await pool.query(
      `INSERT INTO events (title, organizer, date, location, event_type, description, created_by, approved)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [title, organizer, date, location, event_type, description, created_by, true]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error inserting event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



module.exports = router;
