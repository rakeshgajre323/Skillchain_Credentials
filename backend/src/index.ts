import express from 'express';
import cors from 'cors';
import { ENV } from './config/env';
import prisma from './config/db';

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }) as any); // Allow Frontend
app.use(express.json());

// Health Check
app.get('/health', async (req, res) => {
  try {
    // Simple query to verify DB connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'ok', 
      dbStatus: 'connected', 
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error('Health Check Failed:', error);
    res.status(500).json({ 
      status: 'error', 
      dbStatus: 'disconnected', 
      error: String(error) 
    });
  }
});

// Root Route
app.get('/', (req, res) => {
  res.send('SkillChain Backend (Postgres/Prisma) is Running');
});

// Global Error Handler
app.use((err: any, req: express.Request, res: any, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = ENV.PORT;
app.listen(PORT, () => {
  console.log(`------------------------------------------------`);
  console.log(`Server running on port ${PORT}`);
  console.log(`Database URL: ${ENV.DATABASE_URL}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`------------------------------------------------`);
});