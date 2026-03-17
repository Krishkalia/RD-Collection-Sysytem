const mongoose = require('mongoose');

const rdAccountSchema = new mongoose.Schema({
  accountNumber: { type: String, required: true, unique: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true }, // collecting agent
  startDate: { type: Date, required: true },
  maturityDate: { type: Date, required: true },
  installmentAmount: { type: Number, required: true },
  installmentFrequency: { type: String, required: true, default: 'monthly' },
  tenureMonths: { type: Number, required: true },
  status: { type: String, default: 'active', enum: ['active', 'matured', 'closed', 'defaulted'] },
  totalDeposited: { type: Number, default: 0 },
  maturityAmount: { type: Number, required: true },
  totalInterestEarned: { type: Number, default: 0 },
}, { timestamps: true });

/**
 * Generate a unique RD Account Number in the format: RD-YYYY-XXXXXX
 * e.g. RD-2026-000001, RD-2026-000042
 * Uses the last existing account to determine the next sequential number.
 */
rdAccountSchema.statics.generateAccountNumber = async function () {
  const year = new Date().getFullYear();
  const prefix = `RD-${year}-`;

  // Find the latest account created this year with this prefix
  const last = await this.findOne(
    { accountNumber: { $regex: `^${prefix}` } },
    { accountNumber: 1 },
    { sort: { accountNumber: -1 } }
  );

  let nextSeq = 1;
  if (last) {
    const lastSeq = parseInt(last.accountNumber.split('-')[2], 10);
    if (!isNaN(lastSeq)) nextSeq = lastSeq + 1;
  }

  // Zero-pad to 6 digits
  return `${prefix}${String(nextSeq).padStart(6, '0')}`;
};

module.exports = mongoose.model('RDAccount', rdAccountSchema);
