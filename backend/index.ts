import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './src/config/db';
import Certificate from './src/models/Certificate';
import User from './src/models/User';
import authRoutes from './src/routes/auth';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Casting to any to avoid TypeScript overload mismatch with Express types
app.use(cors() as any);
app.use(express.json() as any);

// Connect to MongoDB
connectDB();

// --- Routes ---

// Auth Routes
app.use('/api/auth', authRoutes);

// Health Check (Standardized with DB Status)
app.get('/health', (req, res) => {
  // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : 'disconnected';
  
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    dbStatus, 
    dbState 
  });
});

// Root Route
app.get('/', (req, res) => {
  res.send('SkillChain Backend is Running');
});

// GET /api/certificates - Fetch all certificates
app.get('/api/certificates', async (req, res) => {
  console.log('GET /api/certificates called');
  try {
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }
    const certificates = await Certificate.find().sort({ createdAt: -1 });
    
    const formattedCertificates = certificates.map(cert => ({
      ...cert.toObject(),
      id: cert._id.toString()
    }));
    
    res.json(formattedCertificates);
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ message: 'Server Error', error: String(error) });
  }
});

// POST /api/certificates - Create a new certificate
app.post('/api/certificates', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database disconnected' });
    }
    
    // In a real app, verify user role from token middleware here
    const cert = await Certificate.create({
      ...req.body,
      // Ensure certificateId is unique if not provided
      certificateId: req.body.certificateId || `crt-${Date.now()}-${Math.floor(Math.random()*1000)}`
    });
    
    res.status(201).json(cert);
  } catch (error) {
    console.error('Error creating certificate:', error);
    res.status(500).json({ message: 'Failed to create certificate' });
  }
});

// PUT /api/certificates/:id - Update a certificate
app.put('/api/certificates/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database disconnected' });
    }

    // In real app, check auth/ownership
    const { issuerName } = req.body;
    const certId = req.params.id;
    
    // Use findOneAndUpdate with the public ID or mongo ID. 
    // The frontend passes cert.id which is likely the mongo ID string if fetched from DB, or '1' if mock.
    // Let's try to update by _id.
    let updatedCert;
    if (mongoose.isValidObjectId(certId)) {
        updatedCert = await Certificate.findByIdAndUpdate(
            certId, 
            { issuerName }, 
            { new: true }
        );
    } else {
        // Fallback search by certificateId if not a valid ObjectId (e.g. legacy or mock sync)
        updatedCert = await Certificate.findOneAndUpdate(
            { certificateId: certId },
            { issuerName },
            { new: true }
        );
    }

    if (!updatedCert) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    res.json({
        ...updatedCert.toObject(),
        id: updatedCert._id.toString()
    });
  } catch (error) {
    console.error('Error updating certificate:', error);
    res.status(500).json({ message: 'Failed to update certificate' });
  }
});

// GET /api/certificates/student/:apparId - Fetch by Student ID
app.get('/api/certificates/student/:apparId', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }
    const certificates = await Certificate.find({ studentApparId: req.params.apparId });
    res.json(certificates);
  } catch (error) {
    console.error('Error fetching student certificates:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET /api/admin/stats - Admin Dashboard Stats
app.get('/api/admin/stats', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database disconnected' });
    }

    const totalUsers = await User.countDocuments();
    const totalCertificates = await Certificate.countDocuments();
    
    const students = await User.countDocuments({ role: 'STUDENT' });
    const institutes = await User.countDocuments({ role: 'INSTITUTE' });
    const companies = await User.countDocuments({ role: 'COMPANY' });

    // Mock trend data (in production, aggregate via Mongoose)
    const recentActivity = [
        { name: 'Mon', newUsers: 4, issuedCerts: 2 },
        { name: 'Tue', newUsers: 3, issuedCerts: 5 },
        { name: 'Wed', newUsers: 7, issuedCerts: 8 },
        { name: 'Thu', newUsers: 5, issuedCerts: 4 },
        { name: 'Fri', newUsers: 9, issuedCerts: 12 },
        { name: 'Sat', newUsers: 2, issuedCerts: 1 },
        { name: 'Sun', newUsers: 1, issuedCerts: 0 },
    ];

    res.json({
      totalUsers,
      totalCertificates,
      roles: { students, institutes, companies },
      recentActivity
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Seed Endpoint
app.get('/api/seed-check', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: "Database disconnected" });
    }

    const count = await Certificate.countDocuments();
    if (count === 0) {
        console.log('DB empty, seeding mock data...');
        const mockData = [
            {
                certificateId: 'crt-88293-uuid',
                studentName: 'Rakesh Gajre',
                studentApparId: 'APPAR-2023-992',
                courseName: 'Advanced Full-Stack Development',
                grade: 'A+',
                issuerName: 'Tech Institute of India',
                issueDate: '2023-10-15',
                ipfsCid: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
                blockchainTx: '0x7129038...8923',
                isValid: true,
                imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000&auto=format&fit=crop'
            },
            {
                certificateId: 'crt-99120-uuid',
                studentName: 'Rakesh Gajre',
                studentApparId: 'APPAR-2023-992',
                courseName: 'Blockchain Fundamentals',
                grade: 'A',
                issuerName: 'Polygon Academy',
                issueDate: '2023-08-20',
                ipfsCid: 'QmZ43...kLm2',
                blockchainTx: '0x82301...1120',
                isValid: true,
                // No image for this one to test fallback
            }
        ];
        await Certificate.insertMany(mockData);
        return res.json({ seeded: true, message: "Database seeded" });
    }
    res.json({ seeded: false, message: "Database already has data" });
  } catch (error) {
    console.error("Seed error:", error);
    res.status(500).json({ error: "Seed failed" });
  }
});

app.listen(PORT, () => {
  console.log(`------------------------------------------------`);
  console.log(`Server running on port ${PORT}`);
  
  // Debugging Info
  const mongoUri = process.env.MONGO_URI || '';
  const maskedUri = mongoUri.replace(/(mongodb\+srv:\/\/)([^:]+):([^@]+)(@.+)/, '$1$2:****$4');
  
  console.log(`Mongo URI: ${mongoUri ? maskedUri : 'NOT SET'}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`------------------------------------------------`);
});