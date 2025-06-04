import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  username: { type: String, required: true },
  amount: { type: Number, required: true },
  memo: { type: String },
  product: { type: String, required: true },
  type: { type: String, enum: ['marketplace', 'social', 'pubg', 'mlbb', 'tournament'], required: true },
  userEmail: { type: String, required: true },
  socialUrl: { type: String },
  pubgId: { type: Number },
  ucAmount: { type: Number },
  mlbbUserId: { type: Number },
  mlbbZoneId: { type: Number },
  diasAmount: { type: Number },
  status: { type: String, enum: ['pending', 'approved', 'completed', 'failed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
