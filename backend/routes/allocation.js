const express = require('express');
const router = express.Router();
const Allocation = require('../models/Allocation');
const Agent = require('../models/Agent');
const Customer = require('../models/Customer');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Get all allocations (Admin)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const allocations = await Allocation.find()
            .populate({ path: 'agentId', populate: { path: 'userId', select: 'name' } })
            .populate({ path: 'customerId', populate: { path: 'userId', select: 'name' } });
        res.json(allocations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create new allocation (Admin)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { agentId, customerId, planId } = req.body;
        
        // Deactivate existing active allocation for this customer (if any)
        await Allocation.updateMany({ customerId, active: true }, { active: false });

        const allocation = new Allocation({ agentId, customerId, planId, active: true });
        await allocation.save();
        
        res.status(201).json(allocation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Toggle allocation status
router.put('/:id/toggle', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const allocation = await Allocation.findById(req.params.id);
        if (!allocation) return res.status(404).json({ error: 'Allocation not found' });
        
        allocation.active = !allocation.active;
        await allocation.save();
        
        res.json(allocation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
