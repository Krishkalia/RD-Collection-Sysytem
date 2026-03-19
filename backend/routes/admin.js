const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Agent = require('../models/Agent');
const Customer = require('../models/Customer');
const Plan = require('../models/Plan');
const RDAccount = require('../models/RDAccount');
const CollectionEntry = require('../models/CollectionEntry');
const Notification = require('../models/Notification');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// All routes here should be protected by auth and admin middleware
router.use(authMiddleware);
router.use(adminMiddleware);

// ========================
// DASHBOARD STATS
// ========================

router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // 1. Total Agents & Growth
    const totalAgents = await Agent.countDocuments({ status: 'active' });
    const lastMonthAgents = await Agent.countDocuments({ 
        status: 'active', 
        createdAt: { $lt: firstDayThisMonth } 
    });
    const agentsGrowth = lastMonthAgents === 0 ? 100 : Math.round(((totalAgents - lastMonthAgents) / lastMonthAgents) * 100);

    // 2. Active Customers & Growth
    const totalCustomers = await Customer.countDocuments();
    const lastMonthCustomers = await Customer.countDocuments({ 
        createdAt: { $lt: firstDayThisMonth } 
    });
    const customersGrowth = lastMonthCustomers === 0 ? 100 : Math.round(((totalCustomers - lastMonthCustomers) / lastMonthCustomers) * 100);

    // 3. Today's Collection & Monthly Growth
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayCollections = await CollectionEntry.aggregate([
      { $match: { collectionDate: { $gte: startOfDay, $lte: endOfDay } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const thisMonthCollections = await CollectionEntry.aggregate([
        { $match: { collectionDate: { $gte: firstDayThisMonth } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const lastMonthCollections = await CollectionEntry.aggregate([
        { $match: { collectionDate: { $gte: firstDayLastMonth, $lte: lastDayLastMonth } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const thisMonthTotal = thisMonthCollections[0]?.total || 0;
    const lastMonthTotal = lastMonthCollections[0]?.total || 0;
    const collectionGrowth = lastMonthTotal === 0 ? (thisMonthTotal > 0 ? 100 : 0) : Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100);

    // 4. Total Plans & Growth
    const totalPlans = await Plan.countDocuments();
    const lastMonthPlans = await Plan.countDocuments({ 
        createdAt: { $lt: firstDayThisMonth } 
    });
    const plansGrowth = lastMonthPlans === 0 ? 100 : Math.round(((totalPlans - lastMonthPlans) / lastMonthPlans) * 100);

    // 5. Recent Chart Data (Last 7 Days)
    const last7Days = await CollectionEntry.aggregate([
      { $match: { collectionDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
      { $group: { 
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$collectionDate" } }, 
          total: { $sum: "$amount" } 
      } },
      { $sort: { "_id": 1 } }
    ]);

    // 6. Recent Notifications
    const recentNotifications = await Notification.find({})
        .sort({ sentAt: -1 })
        .limit(5);

    res.json({
      totalAgents,
      agentsGrowth,
      totalCustomers,
      customersGrowth,
      todayCollection: todayCollections[0]?.total || 0,
      collectionGrowth,
      totalPlans,
      plansGrowth,
      chartData: last7Days,
      recentNotifications
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================
// AGENT MANAGEMENT
// ========================

// Get all agents
router.get('/agents', async (req, res) => {
  try {
    const agents = await Agent.find().populate('userId', 'name email status');
    res.json(agents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new agent
router.post('/agents', async (req, res) => {
  try {
    const { name, email, password, phone, address, commissionRate } = req.body;

    // 1. Create the User record (userType 2 = Agent)
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      userType: 2 
    });
    await user.save();

    // 2. Create the Agent profile linked to the User
    const agent = new Agent({
      userId: user._id,
      phone,
      address,
      commissionRate
    });
    await agent.save();

    res.status(201).json({ message: 'Agent created successfully', agent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit agent details (phone, address, commissionRate)
router.put('/agents/:id', async (req, res) => {
  try {
    const { phone, address, commissionRate, name } = req.body;
    const agent = await Agent.findByIdAndUpdate(
      req.params.id,
      { phone, address, commissionRate },
      { new: true }
    );
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    if (name) await User.findByIdAndUpdate(agent.userId, { name });
    res.json({ message: 'Agent updated successfully', agent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle agent active/inactive status
router.put('/agents/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const agent = await Agent.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    await User.findByIdAndUpdate(agent.userId, { status });
    res.json({ message: `Agent ${status === 'active' ? 'reactivated' : 'deactivated'} successfully`, agent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================
// CUSTOMER MANAGEMENT
// ========================

// Get all customers
router.get('/customers', async (req, res) => {
  try {
    const customers = await Customer.find().populate('userId', 'name email status');
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new customer
router.post('/customers', async (req, res) => {
  try {
    const { name, email, password, phone, dob, address } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      userType: 3 // Customer
    });
    await user.save();

    const customer = new Customer({
      userId: user._id,
      phone,
      dob,
      address
    });
    await customer.save();

    user.customerId = customer._id;
    await user.save();

    res.status(201).json({ message: 'Customer created successfully', customer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit customer details
router.put('/customers/:id', async (req, res) => {
  try {
    const { phone, dob, address, name } = req.body;
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { phone, dob, address },
      { new: true }
    );
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    if (name) await User.findByIdAndUpdate(customer.userId, { name });
    res.json({ message: 'Customer updated successfully', customer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle customer status
router.put('/customers/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    
    await User.findByIdAndUpdate(customer.userId, { status });
    res.json({ message: `Customer ${status === 'active' ? 'reactivated' : 'deactivated'} successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================
// PLAN MANAGEMENT
// ========================

router.get('/plans', async (req, res) => {
  try {
    const plans = await Plan.find().lean();
    
    // Add customer count for each plan
    const plansWithCounts = await Promise.all(plans.map(async (plan) => {
        const count = await RDAccount.countDocuments({ planId: plan._id, status: 'active' });
        return { ...plan, customerCount: count };
    }));

    res.json(plansWithCounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get subscribers for a specific plan
router.get('/plans/:id/subscribers', async (req, res) => {
  try {
    const subscribers = await RDAccount.find({
      planId: new mongoose.Types.ObjectId(req.params.id) 
    })
      .populate({
        path: 'customerId',
        populate: { path: 'userId', select: 'name email phone' }
      })
      .populate({
        path: 'agentId',
        populate: { path: 'userId', select: 'name' }
      })
      .populate('planId');
    
    res.json(subscribers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/plans', async (req, res) => {
  try {
    const { name, monthlyInstallment, tenureMonths, annualInterestRate, maturityAmount } = req.body;
    const calculatedMaturity = maturityAmount || (monthlyInstallment * tenureMonths) * (1 + (annualInterestRate/100));
    const plan = new Plan({ name, monthlyInstallment, tenureMonths, annualInterestRate, maturityAmount: calculatedMaturity });
    await plan.save();
    res.status(201).json({ message: 'Plan created successfully', plan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/plans/:id', async (req, res) => {
  try {
    const { name, monthlyInstallment, tenureMonths, annualInterestRate, maturityAmount } = req.body;
    const calculatedMaturity = maturityAmount || (monthlyInstallment * tenureMonths) * (1 + (annualInterestRate/100));
    const plan = await Plan.findByIdAndUpdate(req.params.id, { name, monthlyInstallment, tenureMonths, annualInterestRate, maturityAmount: calculatedMaturity }, { new: true });
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    res.json({ message: 'Plan updated successfully', plan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/plans/:id', async (req, res) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    res.json({ message: 'Plan deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================
// ACCOUNT OPENING
// ========================

router.post('/accounts/open', async (req, res) => {
  try {
    const { customerId, planId, agentId, installmentAmount, startDate } = req.body;
    const customer = await Customer.findById(customerId).populate('userId');
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    if (customer.userId.status !== 'active') return res.status(400).json({ error: 'Cannot open account for an inactive customer' });

    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    const start = startDate ? new Date(startDate) : new Date();
    const maturity = new Date(start);
    maturity.setMonth(maturity.getMonth() + plan.tenureMonths);
    const maturityAmount = (installmentAmount * plan.tenureMonths) * (1 + (plan.annualInterestRate/100));

    const rdAccount = new RDAccount({
      accountNumber: await RDAccount.generateAccountNumber(),
      customerId, planId, agentId, installmentAmount, tenureMonths: plan.tenureMonths, totalDeposited: 0, maturityAmount, startDate: start, maturityDate: maturity, status: 'active'
    });
    await rdAccount.save();
    await Customer.findByIdAndUpdate(customerId, { $push: { rdAccounts: rdAccount._id } });
    res.status(201).json({ message: 'RD Account opened successfully', rdAccount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================
// REPORTS
// ========================

router.get('/reports/daily', async (req, res) => {
  try {
    const { date } = req.query;
    const searchDate = date ? new Date(date) : new Date();
    
    // Set range from 00:00:00 to 23:59:59 in the local search date
    const startOfDay = new Date(searchDate); 
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(searchDate); 
    endOfDay.setHours(23, 59, 59, 999);


    const report = await CollectionEntry.aggregate([
      { $match: { collectionDate: { $gte: startOfDay, $lte: endOfDay } } },
      { $group: { _id: "$agentId", totalAmount: { $sum: "$amount" }, entriesCount: { $sum: 1 } } },
      { $lookup: { from: "agents", localField: "_id", foreignField: "_id", as: "agentDetails" } },
      { $unwind: "$agentDetails" },
      { $lookup: { from: "users", localField: "agentDetails.userId", foreignField: "_id", as: "userDetails" } },
      { $unwind: "$userDetails" },
      { $project: { agentName: "$userDetails.name", totalAmount: 1, entriesCount: 1 } }
    ]);
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify Customer KYC
router.put('/customers/:id/verify-kyc', async (req, res) => {
  try {
    const { status } = req.body; // 'verified' or 'pending' or 'rejected'
    const customer = await Customer.findByIdAndUpdate(
      req.params.id, 
      { kycStatus: status },
      { new: true }
    );
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json({ message: `Customer KYC ${status}`, customer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all RD accounts
router.get('/accounts', async (req, res) => {
  try {
    const accounts = await RDAccount.find()
      .populate({ path: 'customerId', populate: { path: 'userId', select: 'name' } })
      .populate('planId')
      .populate({ path: 'agentId', populate: { path: 'userId', select: 'name' } })
      .sort({ createdAt: -1 });
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get history for specific account (Passbook)
router.get('/accounts/:id/history', async (req, res) => {
    try {
        const collections = await CollectionEntry.find({ rdAccountId: req.params.id })
            .sort({ collectionDate: -1 });
        res.json(collections);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Update Agent for an RD Account
router.put('/accounts/:id/agent', async (req, res) => {
    try {
        const { agentId } = req.body;
        const account = await RDAccount.findByIdAndUpdate(
            req.params.id, 
            { agentId },
            { new: true }
        ).populate({ path: 'agentId', populate: { path: 'userId', select: 'name' } });
        
        if (!account) return res.status(404).json({ error: 'Account not found' });
        res.json({ message: 'Agent reassigned successfully', account });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

