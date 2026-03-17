const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  status: { type: String, default: 'active', enum: ['active', 'inactive', 'suspended'] },
  commissionRate: { type: Number, required: true }, // percentage
}, { timestamps: true });

module.exports = mongoose.model('Agent', agentSchema);
