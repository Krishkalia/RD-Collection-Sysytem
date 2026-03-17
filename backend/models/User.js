const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: Number, required: true, enum: [1, 2, 3] }, // 1: Admin, 2: Agent, 3: Customer
  status: { type: String, default: 'active', enum: ['active', 'inactive', 'suspended'] },
  
  // These are for specific user types. 
  // Another approach is just having separate models, but since the requirement 
  // mentioned FKs on the User model, we'll include them here.
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
