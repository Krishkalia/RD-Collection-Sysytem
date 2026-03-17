const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema({
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  commissionAmount: { type: Number, required: true },
  commissionRate: { type: Number, required: true }, // copy from agent at time of entry
  paidStatus: { type: String, default: 'unpaid', enum: ['paid', 'unpaid'] },
  paidAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Commission', commissionSchema);
