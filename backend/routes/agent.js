const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { authMiddleware, agentMiddleware } = require('../middleware/auth');
const Agent = require('../models/Agent');
const Customer = require('../models/Customer');
const RDAccount = require('../models/RDAccount');
const CollectionEntry = require('../models/CollectionEntry');
const User = require('../models/User');

// Middleware to get Agent ID from User ID
const getAgentId = async (req, res, next) => {
    try {
        const agent = await Agent.findOne({ userId: req.user.userId });
        if (!agent) return res.status(404).json({ error: 'Agent profile not found' });
        req.agentId = agent._id;
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

router.use(authMiddleware);
router.use(agentMiddleware);
router.use(getAgentId);

// @route   GET /api/agent/stats
// @desc    Get agent dashboard statistics
router.get('/stats', async (req, res) => {
    try {
        const agentId = req.agentId;

        // Assigned Customers count (through RDAccounts)
        const assignedCustomerIds = await RDAccount.find({ agentId }).distinct('customerId');
        const customerCount = assignedCustomerIds.length;

        // Collection stats for Today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const todayCollections = await CollectionEntry.aggregate([
            { $match: { agentId: new mongoose.Types.ObjectId(agentId), collectionDate: { $gte: startOfDay, $lte: endOfDay } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        // Collection stats for Month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthCollections = await CollectionEntry.aggregate([
            { $match: { agentId: new mongoose.Types.ObjectId(agentId), collectionDate: { $gte: startOfMonth, $lte: endOfDay } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const agent = await Agent.findById(agentId);
        const commissionRate = agent.commissionRate;
        let rank = 'Bronze';
        if (commissionRate > 5) rank = 'Gold';
        else if (commissionRate >= 3) rank = 'Silver';

        res.json({
            assignedCustomers: customerCount,
            todayCollection: todayCollections[0]?.total || 0,
            monthCollection: monthCollections[0]?.total || 0,
            commissionRate,
            rank
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   GET /api/agent/customers
// @desc    Get all customers assigned to the agent
router.get('/customers', async (req, res) => {
    try {
        // Find customers linked to this agent in RDAccounts (or specifically assigned?)
        // Let's check Customer model if it has an agentId or find via RDAccounts
        const customers = await Customer.find({}).populate('userId', 'name email');
        
        // Filter customers who have at least one RD Account with this agent
        // A better way would be a direct link in Customer model. 
        // Let's find all RDAccounts for this agent and get unique customerIds
        const accounts = await RDAccount.find({ agentId: req.agentId }).distinct('customerId');
        const assignedCustomers = await Customer.find({ _id: { $in: accounts } }).populate('userId', 'name email');

        res.json(assignedCustomers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   GET /api/agent/customer/:id/accounts
// @desc    Get RD accounts for a specific customer assigned to the agent
router.get('/customer/:id/accounts', async (req, res) => {
    try {
        const accounts = await RDAccount.find({ 
            customerId: req.params.id, 
            agentId: req.agentId,
            status: 'active'
        }).populate('planId');
        res.json(accounts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   POST /api/agent/collections
// @desc    Record a new collection entry
router.post('/collections', async (req, res) => {
    try {
        const { rdAccountId, amount, paymentMode, remarks } = req.body;

        const account = await RDAccount.findById(rdAccountId);
        if (!account) return res.status(404).json({ error: 'RD Account not found' });

        // Verify ownership/assignment
        if (account.agentId.toString() !== req.agentId.toString()) {
            return res.status(403).json({ error: 'You are not authorized for this account' });
        }

        const installmentNumber = Math.floor(account.totalDeposited / account.installmentAmount) + 1;

        const collection = new CollectionEntry({
            rdAccountId,
            customerId: account.customerId,
            agentId: req.agentId,
            amount,
            paymentMode,
            remarks,
            installmentNumber,
            status: 'confirmed' // Assuming agents confirm on spot for now
        });

        await collection.save();

        // Update RD Account balance
        account.totalDeposited += amount;
        await account.save();

        // Create Notification for Customer
        const Notification = require('../models/Notification');
        const notification = new Notification({
            userId: account.customerId.userId, // This might need a populate in backend or direct access
            title: 'Payment Received',
            message: `A payment of ₹${amount} has been recorded for your RD Account ${account.accountNumber}.`,
            type: 'payment'
        });
        // We need to ensure we have the userId for the notification. 
        // Let's populate the customer to get the userId.
        const populatedCustomer = await Customer.findById(account.customerId);
        if (populatedCustomer) {
            notification.userId = populatedCustomer.userId;
            await notification.save();
        }

        res.status(201).json({ message: 'Collection recorded successfully', collection });
    } catch (err) {

        res.status(500).json({ error: err.message });
    }
});

// @route   GET /api/agent/collections
// @desc    Get collection history for the agent
router.get('/collections', async (req, res) => {
    try {
        const collections = await CollectionEntry.find({ agentId: req.agentId })
            .populate({
                path: 'customerId',
                populate: { path: 'userId', select: 'name' }
            })
            .populate({
                path: 'rdAccountId',
                populate: { path: 'planId', select: 'name' }
            })
            .sort({ collectionDate: -1 });
        res.json(collections);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
