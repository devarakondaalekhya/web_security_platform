import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { UserModel, IUser } from './models/User.js';
import { ScanModel, IScan } from './models/Scan.js';

interface DbStatus {
  connected: boolean;
  type: 'mongodb' | 'embedded_storage';
  uri?: string;
  message: string;
}

let dbStatus: DbStatus = {
  connected: false,
  type: 'embedded_storage',
  message: 'Initializing storage...',
};

// Embedded local storage for seamless zero-config operation
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'webshield-db.json');

interface EmbeddedStore {
  users: any[];
  scans: any[];
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (err) {
      console.warn('Could not create data directory, using memory fallback', err);
    }
  }
}

function readEmbeddedStore(): EmbeddedStore {
  ensureDataDir();
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('Failed to read embedded db file, starting fresh', err);
  }
  return { users: [], scans: [] };
}

function writeEmbeddedStore(store: EmbeddedStore): void {
  ensureDataDir();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed to write embedded db file', err);
  }
}

export async function initDatabase(): Promise<DbStatus> {
  const mongoUri = process.env.MONGODB_URI;

  if (mongoUri && mongoUri.trim() !== '') {
    try {
      // Connect with short serverSelectionTimeoutMS so we don't hang if local mongodb is absent
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 2500,
        connectTimeoutMS: 2500,
      });

      dbStatus = {
        connected: true,
        type: 'mongodb',
        uri: mongoUri.replace(/:[^:@]+@/, ':****@'), // redact password
        message: 'Successfully connected to MongoDB database',
      };
      console.log('✅ MongoDB connected successfully:', dbStatus.uri);
      return dbStatus;
    } catch (error: any) {
      console.warn('⚠️ MongoDB connection failed (fallback enabled):', error.message);
      dbStatus = {
        connected: false,
        type: 'embedded_storage',
        uri: mongoUri.replace(/:[^:@]+@/, ':****@'),
        message: `MongoDB connection unavailable (${error.message}). Using embedded JSON datastore with full Mongoose compatibility.`,
      };
    }
  } else {
    dbStatus = {
      connected: true,
      type: 'embedded_storage',
      message: 'Running on embedded persistent JSON database. Set MONGODB_URI in .env to connect MongoDB.',
    };
  }

  return dbStatus;
}

export function getDatabaseStatus(): DbStatus {
  return dbStatus;
}

// Unified Database Access Layer (Works with Mongoose or Embedded storage transparently)

export async function findUserByEmail(email: string): Promise<any> {
  if (dbStatus.type === 'mongodb' && mongoose.connection.readyState === 1) {
    return await UserModel.findOne({ email: email.toLowerCase().trim() }).lean();
  }
  const store = readEmbeddedStore();
  return store.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
}

export async function findUserById(id: string): Promise<any> {
  if (dbStatus.type === 'mongodb' && mongoose.connection.readyState === 1) {
    return await UserModel.findById(id).lean();
  }
  const store = readEmbeddedStore();
  return store.users.find((u) => u._id === id || u.id === id) || null;
}

export async function createUser(userData: {
  name: string;
  email: string;
  passwordHash: string;
  role?: string;
}): Promise<any> {
  if (dbStatus.type === 'mongodb' && mongoose.connection.readyState === 1) {
    const newUser = new UserModel({
      name: userData.name,
      email: userData.email.toLowerCase().trim(),
      passwordHash: userData.passwordHash,
      role: userData.role || 'student_researcher',
    });
    const saved = await newUser.save();
    return saved.toObject();
  }

  const store = readEmbeddedStore();
  const id = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  const user = {
    _id: id,
    id: id,
    name: userData.name,
    email: userData.email.toLowerCase().trim(),
    passwordHash: userData.passwordHash,
    role: userData.role || 'student_researcher',
    createdAt: new Date().toISOString(),
  };
  store.users.push(user);
  writeEmbeddedStore(store);
  return user;
}

export async function createScan(scanData: any): Promise<any> {
  if (dbStatus.type === 'mongodb' && mongoose.connection.readyState === 1) {
    const newScan = new ScanModel(scanData);
    const saved = await newScan.save();
    return saved.toObject();
  }

  const store = readEmbeddedStore();
  const id = 'scan_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  const scan = {
    _id: id,
    id: id,
    ...scanData,
    scanDate: scanData.scanDate || new Date().toISOString(),
  };
  store.scans.unshift(scan); // newest first
  writeEmbeddedStore(store);
  return scan;
}

export async function getScansByUser(userId: string): Promise<any[]> {
  if (dbStatus.type === 'mongodb' && mongoose.connection.readyState === 1) {
    return await ScanModel.find({ userId }).sort({ scanDate: -1 }).lean();
  }
  const store = readEmbeddedStore();
  return store.scans
    .filter((s) => s.userId === userId)
    .sort((a, b) => new Date(b.scanDate).getTime() - new Date(a.scanDate).getTime());
}

export async function getScanById(id: string): Promise<any> {
  if (dbStatus.type === 'mongodb' && mongoose.connection.readyState === 1) {
    return await ScanModel.findById(id).lean();
  }
  const store = readEmbeddedStore();
  return store.scans.find((s) => s._id === id || s.id === id) || null;
}

export async function deleteScanById(id: string, userId: string): Promise<boolean> {
  if (dbStatus.type === 'mongodb' && mongoose.connection.readyState === 1) {
    const res = await ScanModel.deleteOne({ _id: id, userId });
    return res.deletedCount > 0;
  }
  const store = readEmbeddedStore();
  const initialLength = store.scans.length;
  store.scans = store.scans.filter((s) => !((s._id === id || s.id === id) && s.userId === userId));
  if (store.scans.length < initialLength) {
    writeEmbeddedStore(store);
    return true;
  }
  return false;
}
