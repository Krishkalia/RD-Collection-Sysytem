const mongoose = require('mongoose');

const allocationSchema = new mongoose.Schema({
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' }, // optional: if allocation is plan-specific
  assignedAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Allocation', allocationSchema);
