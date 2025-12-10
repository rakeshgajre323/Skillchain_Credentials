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
    enum: ['student', 'institute', 'company', 'admin'],
    default: 'student',
  },
  // Student Specific
  apparId: {
    type: String,
    unique: true,
    sparse: true, // Only enforces uniqueness if the field exists
  },
  dob: Date,
  phone: String,
  
  // Institute Specific
  recognitionNumber: String,
  isVerified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

export default mongoose.model('User', userSchema);
