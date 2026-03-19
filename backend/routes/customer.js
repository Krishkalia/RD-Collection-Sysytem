const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { authMiddleware, customerMiddleware } = require('../middleware/auth');
const Customer = require('../models/Customer');
const RDAccount = require('../models/RDAccount');
const CollectionEntry = require('../models/CollectionEntry');
const upload = require('../middleware/upload');

// Middleware to get Customer ID from User ID
const getCustomerId = async (req, res, next) => {
    try {
        const customer = await Customer.findOne({ userId: req.user.userId });
        if (!customer) {
            return res.status(404).json({ error: 'Customer profile not found' });
        }
        req.customerId = customer._id;
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

router.use(authMiddleware);
router.use(customerMiddleware);
router.use(getCustomerId);

// @route   GET /api/customer/me
// @desc    Get current customer profile
router.get('/me', async (req, res) => {
    try {
        const customer = await Customer.findById(req.customerId).populate('userId', 'name email');
        if (!customer) return res.status(404).json({ error: 'Customer not found' });
        res.json(customer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   GET /api/customer/stats
// @desc    Get customer dashboard statistics
router.get('/stats', async (req, res) => {
    try {
        const customerId = req.customerId;
        
        const accounts = await RDAccount.find({ customerId, status: 'active' });
        
        const totalDeposited = accounts.reduce((sum, acc) => sum + acc.totalDeposited, 0);
        const expectedMaturity = accounts.reduce((sum, acc) => sum + acc.maturityAmount, 0);

        // Find next due payment (simplification: find the oldest account and check its cycle)
        // For now, let's just return a placeholder or calculate based on last collection
        // Let's find latest collection and add 1 month
        const latestColl = await CollectionEntry.findOne({ customerId }).sort({ collectionDate: -1 });
        let nextDueDate = 'N/A';
        let nextDueAmount = 0;

        if (latestColl) {
            const lastDate = new Date(latestColl.collectionDate);
            lastDate.setMonth(lastDate.getMonth() + 1);
            nextDueDate = lastDate.toLocaleDateString();
            nextDueAmount = accounts[0]?.installmentAmount || 0; // Simplified
        } else if (accounts.length > 0) {
            nextDueDate = new Date().toLocaleDateString();
            nextDueAmount = accounts[0].installmentAmount;
        }

        res.json({
            totalDeposited,
            expectedMaturity,
            activeAccounts: accounts.length,
            nextDueAmount,
            nextDueDate
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   GET /api/customer/accounts
// @desc    Get all RD accounts for the logged-in customer
router.get('/accounts', async (req, res) => {
    try {
        const accounts = await RDAccount.find({ customerId: req.customerId })
            .populate('planId')
            .populate({
                path: 'agentId',
                populate: { path: 'userId', select: 'name phone' }
            });
        res.json(accounts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   GET /api/customer/transactions
// @desc    Get full transaction history (Passbook)
router.get('/transactions', async (req, res) => {
    try {
        const collections = await CollectionEntry.find({ customerId: req.customerId })
            .populate({
                path: 'rdAccountId',
                populate: { path: 'planId', select: 'name' }
            })
            .populate({
                path: 'agentId',
                populate: { path: 'userId', select: 'name' }
            })
            .sort({ collectionDate: -1 });
        res.json(collections);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   PUT /api/customer/profile
// @desc    Update customer profile
router.put('/profile', async (req, res) => {
    try {
        const { phone, address } = req.body;
        const customer = await Customer.findByIdAndUpdate(
            req.customerId,
            { phone, address },
            { new: true }
        );
        res.json({ message: 'Profile updated successfully', customer });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   POST /api/customer/profile-photo
// @desc    Upload profile photo
router.post('/profile-photo', upload.single('profilePhoto'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Please upload a file' });
        
        const imageUrl = req.file.path || req.file.secure_url || req.file.url;
        const customer = await Customer.findByIdAndUpdate(
            req.customerId,
            { profilePictureUrl: imageUrl },
            { new: true }
        ).populate('userId', 'name email');
        
        res.json({ message: 'Profile photo uploaded successfully', imageUrl, customer });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   POST /api/customer/kyc-upload
// @desc    Upload KYC documents (adharCard, panCard, drivingLicence)
router.post('/kyc-upload', upload.single('document'), async (req, res) => {
    try {
        const { docType } = req.body; // 'adharCard', 'panCard', 'drivingLicence'
        if (!req.file) return res.status(400).json({ error: 'Please upload a file' });
        if (!['adharCard', 'panCard', 'drivingLicence'].includes(docType)) {
            return res.status(400).json({ error: 'Invalid document type' });
        }

        const fileUrl = req.file.path || req.file.secure_url || req.file.url;
        const update = { [docType]: fileUrl, kycStatus: 'pending' };
        
        const customer = await Customer.findByIdAndUpdate(
            req.customerId,
            update,
            { new: true }
        ).populate('userId', 'name email');

        res.json({ message: `${docType} uploaded successfully`, fileUrl, customer });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
