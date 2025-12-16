import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../models/User';
import Otp from '../models/Otp';

const router = express.Router();
const BCRYPT_ROUNDS = 10;
const OTP_EXPIRY_MIN = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_12345';

// --- Helpers ---

// Generate 6 digit numeric code
const genOtpCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// Nodemailer Transport (Dev: Ethereal / Console, Prod: SMTP)
const sendEmail = async (to: string, code: string, isReset = false) => {
  if (process.env.NODE_ENV === 'development' || !process.env.SMTP_HOST) {
    console.log(`\n==================================================`);
    console.log(`[DEV MODE] ${isReset ? 'RESET PASSWORD' : 'VERIFICATION'} OTP for ${to}: ${code}`);
    console.log(`==================================================\n`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const subject = isReset ? 'Reset Your Password' : 'Your Verification Code';
  const text = isReset 
    ? `Use this code to reset your SkillChain password: ${code}. It expires in ${OTP_EXPIRY_MIN} minutes.`
    : `Your SkillChain verification code is: ${code}. It expires in ${OTP_EXPIRY_MIN} minutes.`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"SkillChain" <no-reply@skillchain.com>',
    to,
    subject,
    text,
  });
};

// --- Routes ---

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { 
      role, name, email, password, phone, 
      apparId, recognitionNumber, website, address 
    } = req.body;

    // 1. Validate existence
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // 2. Hash Password
    const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create User (Pending)
    const user = await User.create({
      role,
      name,
      email,
      password: hashedPassword, // Storing hash in 'password' field as per schema
      phone,
      status: 'pending',
      // Role specific
      apparId: role === 'STUDENT' ? apparId : undefined,
      recognitionNumber: role === 'INSTITUTE' ? recognitionNumber : undefined,
      website: role === 'COMPANY' ? website : undefined,
      address: role === 'INSTITUTE' ? address : undefined,
    } as any);

    // 4. Generate & Send OTP
    const code = genOtpCode();
    const codeHash = await bcrypt.hash(code, 10);
    
    await Otp.create({
      userId: user._id,
      codeHash,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MIN * 60 * 1000),
    } as any);

    await sendEmail(email, code);

    res.status(201).json({ 
      userId: user._id, 
      email: user.email,
      message: 'Account created. Please verify your email.' 
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { userId, code } = req.body;

    const otpRecord = await Otp.findOne({ userId }).sort({ createdAt: -1 });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Check expiry
    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Check attempts
    if (otpRecord.attempts >= 5) {
      return res.status(429).json({ message: 'Too many failed attempts. Request a new code.' });
    }

    // Verify Hash
    const isMatch = await bcrypt.compare(code, otpRecord.codeHash);
    if (!isMatch) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ message: 'Invalid OTP code' });
    }

    // Success: Activate User
    const user = await User.findByIdAndUpdate(userId, { status: 'active' }, { new: true });
    
    // Cleanup OTPs
    await Otp.deleteMany({ userId });

    // Generate Token
    const token = jwt.sign(
      { id: user?._id, role: user?.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user?._id,
        name: user?.name,
        email: user?.email,
        role: user?.role,
        status: user?.status,
        apparId: user?.apparId
      }
    });

  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ message: 'Verification failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check Status
    if (user.status !== 'active') {
       return res.status(403).json({ 
         message: 'Account not active', 
         status: user.status,
         userId: user._id 
       });
    }

    // Generate Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        apparId: user.apparId
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// POST /api/auth/resend-otp
router.post('/resend-otp', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Rate limit check (basic) - check if an OTP was sent in last 1 min
    const lastOtp = await Otp.findOne({ userId }).sort({ createdAt: -1 });
    if (lastOtp && (Date.now() - lastOtp.createdAt.getTime() < 60000)) {
       return res.status(429).json({ message: 'Please wait before resending.' });
    }

    const code = genOtpCode();
    const codeHash = await bcrypt.hash(code, 10);
    
    await Otp.create({
      userId: user._id,
      codeHash,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MIN * 60 * 1000),
    } as any);

    await sendEmail(user.email, code);
    res.json({ message: 'New code sent' });

  } catch (error) {
    res.status(500).json({ message: 'Failed to resend' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    // We do not reveal if user exists or not for security, 
    // but if they do, send code.
    if (user) {
      const code = genOtpCode();
      const codeHash = await bcrypt.hash(code, 10);
      
      await Otp.create({
        userId: user._id,
        codeHash,
        expiresAt: new Date(Date.now() + OTP_EXPIRY_MIN * 60 * 1000),
      } as any);

      await sendEmail(email, code, true);
    }

    res.json({ message: 'If an account exists with this email, a reset code has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    const otpRecord = await Otp.findOne({ userId: user._id }).sort({ createdAt: -1 });
    
    if (!otpRecord) return res.status(400).json({ message: 'Invalid or expired code' });
    if (otpRecord.expiresAt < new Date()) return res.status(400).json({ message: 'Code expired' });
    if (otpRecord.attempts >= 5) return res.status(429).json({ message: 'Too many attempts' });

    const isMatch = await bcrypt.compare(code, otpRecord.codeHash);
    if (!isMatch) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ message: 'Invalid code' });
    }

    // Update Password
    const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    user.password = hashedPassword;
    await user.save();

    // Cleanup
    await Otp.deleteMany({ userId: user._id });

    res.json({ message: 'Password updated successfully' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;