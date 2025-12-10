import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
  },
  role: {
    type: String,
    enum: ['STUDENT', 'INSTITUTE', 'COMPANY', 'ADMIN'],
    default: 'STUDENT',
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended'],
    default: 'pending',
  },
  phone: {
    type: String,
    required: false,
  },
  
  // Student Specific
  apparId: {
    type: String,
    unique: true,
    sparse: true, 
  },
  dob: Date,
  instituteId: String,

  // Institute Specific
  recognitionNumber: String,
  address: String,
  verificationDocuments: String, // URL to docs
  isVerified: {
    type: Boolean,
    default: false,
  },

  // Company Specific
  website: String,
}, {
  timestamps: true,
});

export default mongoose.model('User', userSchema);