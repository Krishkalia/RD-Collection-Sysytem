const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Get all settings (Admin)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const settings = await Setting.find();
        // Convert to a key-value object for easier frontend use
        const config = {};
        settings.forEach(s => config[s.key] = s.value);
        res.json(config);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update multiple settings (Admin)
router.post('/batch', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const settings = req.body; // { key1: value1, key2: value2 }
        const ops = Object.keys(settings).map(key => ({
            updateOne: {
                filter: { key },
                update: { value: settings[key] },
                upsert: true
            }
        }));
        
        await Setting.bulkWrite(ops);
        res.json({ message: 'Settings updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
