const mongoose = require('mongoose');

const collectionEntrySchema = new mongoose.Schema({
  rdAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'RDAccount', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
  amount: { type: Number, required: true },
  paymentMode: { type: String, required: true, enum: ['cash', 'upi', 'card', 'online'] },
  transactionId: { type: String }, // from payment gateway
  collectionDate: { type: Date, required: true, default: Date.now },
  installmentNumber: { type: Number, required: true }, // Which installment (1..N)
  lateFee: { type: Number, default: 0 },
  remarks: { type: String },
  status: { type: String, default: 'pending', enum: ['confirmed', 'pending', 'rejected'] },
}, { timestamps: true });

module.exports = mongoose.model('CollectionEntry', collectionEntrySchema);
