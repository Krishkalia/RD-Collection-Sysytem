const express = require('express');
const router = express.Router();
const Commission = require('../models/Commission');
const Agent = require('../models/Agent');
const CollectionEntry = require('../models/CollectionEntry');
const { authMiddleware, adminMiddleware, agentMiddleware } = require('../middleware/auth');

// Get Commission Stats for Admin
router.get('/admin/stats', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

        // 1. Unprocessed Collections (Confirmed collections for current month)
        // Note: For simplicity, we treat any confirmed collection in current month as "to be processed" 
        // until a Commission record is created for this month/year.
        const unprocessedAgg = await CollectionEntry.aggregate([
            { $match: { collectionDate: { $gte: startOfMonth, $lte: endOfMonth }, status: 'confirmed' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        // 2. Ready for Payout (All unpaid commissions)
        const readyForPayoutAgg = await Commission.aggregate([
            { $match: { paidStatus: 'unpaid' } },
            { $group: { _id: null, total: { $sum: "$commissionAmount" } } }
        ]);

        // 3. Agent summary with pending data
        const agents = await Agent.find().populate('userId', 'name');
        const agentSummary = await Promise.all(agents.map(async (agent) => {
            // Pending collections for this agent this month
            const agentPendingColl = await CollectionEntry.aggregate([
                { $match: { 
                    agentId: agent._id, 
                    collectionDate: { $gte: startOfMonth, $lte: endOfMonth }, 
                    status: 'confirmed' 
                } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]);

            // check if commission already generated for this month
            const existingComm = await Commission.findOne({ agentId: agent._id, month, year });

            return {
                agentId: agent._id,
                name: agent.userId?.name,
                phone: agent.phone,
                commissionRate: agent.commissionRate,
                pendingCollections: agentPendingColl[0]?.total || 0,
                isProcessed: !!existingComm
            };
        }));

        res.json({
            unprocessedCollections: unprocessedAgg[0]?.total || 0,
            readyForPayout: readyForPayoutAgg[0]?.total || 0,
            agentSummary
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all commissions (Admin)
router.get('/all', authMiddleware, adminMiddleware, async (req, res) => {

    try {
        const commissions = await Commission.find().populate({
            path: 'agentId',
            populate: { path: 'userId', select: 'name' }
        });
        res.json(commissions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get agent commissions (Agent)
router.get('/my', authMiddleware, agentMiddleware, async (req, res) => {
    try {
        const agent = await Agent.findOne({ userId: req.user.userId });
        if (!agent) return res.status(404).json({ error: 'Agent profile not found' });

        const commissions = await Commission.find({ agentId: agent._id }).sort({ year: -1, month: -1 });
        res.json(commissions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Calculate/Generate Commissions for a specific month (Admin)
router.post('/generate', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { month, year, agentId } = req.body; // e.g., 2, 2026, agentId (optional)
        
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

        // Group collections by agent
        const matchStage = { 
            collectionDate: { $gte: startOfMonth, $lte: endOfMonth }, 
            status: 'confirmed' 
        };
        
        if (agentId) {
            matchStage.agentId = new mongoose.Types.ObjectId(agentId);
        }

        const aggregations = await CollectionEntry.aggregate([
            { $match: matchStage },
            { $group: { _id: "$agentId", totalAmount: { $sum: "$amount" } } }
        ]);


        const results = [];
        for (const agg of aggregations) {
            const agent = await Agent.findById(agg._id);
            if (!agent) continue;

            const commissionAmount = (agg.totalAmount * agent.commissionRate) / 100;

            // Update or create commission entry
            const commission = await Commission.findOneAndUpdate(
                { agentId: agent._id, month, year },
                { 
                    commissionAmount, 
                    commissionRate: agent.commissionRate,
                    paidStatus: 'unpaid' 
                },
                { upsert: true, new: true }
            );
            results.push(commission);
        }

        res.json({ message: `Commissions generated for ${month}/${year}`, count: results.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mark as paid (Admin)
router.put('/:id/pay', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const commission = await Commission.findByIdAndUpdate(
            req.params.id,
            { paidStatus: 'paid', paidAt: new Date() },
            { new: true }
        );
        if (!commission) return res.status(404).json({ error: 'Commission record not found' });
        res.json({ message: 'Commission marked as paid', commission });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
