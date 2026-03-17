const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: { type: String, required: true },
  monthlyInstallment: { type: Number, required: true },
  tenureMonths: { type: Number, required: true },
  annualInterestRate: { type: Number, required: true }, // percentage
  maturityAmount: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Plan', planSchema);
