import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  certificateId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  studentName: { 
    type: String, 
    required: true 
  },
  studentApparId: { 
    type: String, 
    required: true 
  },
  courseName: { 
    type: String, 
    required: true 
  },
  grade: { 
    type: String, 
    required: true 
  },
  issuerName: { 
    type: String, 
    required: true 
  },
  issueDate: { 
    type: String, 
    required: true 
  },
  ipfsCid: { 
    type: String, 
    required: true 
  },
  blockchainTx: { 
    type: String, 
    required: true 
  },
  isValid: { 
    type: Boolean, 
    default: true 
  },
  imageUrl: {
    type: String,
    required: false
  }
}, {
  timestamps: true,
});

export default mongoose.model('Certificate', certificateSchema);