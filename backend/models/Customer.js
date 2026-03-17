const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  phone: { type: String, required: true, unique: true },
  dob: { type: Date, required: true },
  address: { type: String, required: true },
  profilePictureUrl: { type: String },
  adharCard: { type: String },
  panCard: { type: String },
  kycStatus: { type: String, default: 'pending', enum: ['pending', 'verified', 'rejected'] },
  rdAccounts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RDAccount' }],
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
