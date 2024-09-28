const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const certificateSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ['GOTS', 'RWS', 'Global Recycled Standard', 'EU Ecolabel'], // Only allowed certificate names
    required: true
  },
  filePath: { type: String, required: true } // Store file paths for the uploaded certificates
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  businessType: { type: String, enum: ['client', 'supplier', 'agent'], required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profile: {
    companyDetails: {
      companyName: { type: String },
      userName: { type: String },
      companyEmail: { type: String, match: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/ },
      address: { type: String },
      ntn: { type: String, match: /^\d{7}-\d$/ },
      gst: { type: String, match: /^\d{2}-\d{2}-\d{4}-\d{3}-\d{2}$/ }
    },
    contactPersonInfo: {
      name: { type: String },
      department: { type: String },
      designation: { type: String },
      email: { type: String, match: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/ },
      phoneNumber: { type: String }
    }
  },
  certificates: [certificateSchema] 
}, { timestamps: true });


userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);
