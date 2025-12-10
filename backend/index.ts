import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './src/config/db';
import Certificate from './src/models/Certificate';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json() as express.RequestHandler);

// Connect to MongoDB
connectDB();

// --- Routes ---

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