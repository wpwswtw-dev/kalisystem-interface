import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Data files paths
const DATA_DIR = path.join(__dirname, '../data');
const DATA_FILES = {
  items: 'items.json',
  categories: 'categories.json',
  suppliers: 'suppliers.json',
  tags: 'tags.json',
  settings: 'settings.json',
  completedOrders: 'completed-orders.json',
  pendingOrders: 'pending-orders.json',
  currentOrder: 'current-order.json',
  currentOrderMetadata: 'current-order-metadata.json'
};

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Read data from file
async function readDataFile(filename) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return appropriate default
    if (error.code === 'ENOENT') {
      if (filename === 'settings.json') {
        return { posMode: true, autosave: true };
      }
      if (filename === 'current-order-metadata.json') {
        return { orderType: 'Delivery' };
      }
      return [];
    }
    throw error;
  }
}

// Write data to file
async function writeDataFile(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// API Routes

// Get all data
app.get('/api/data/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const filename = DATA_FILES[type];
    
    if (!filename) {
      return res.status(400).json({ error: 'Invalid data type' });
    }
    
    const data = await readDataFile(filename);
    res.json(data);
  } catch (error) {
    console.error('Error reading data:', error);
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// Update data
app.post('/api/data/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const filename = DATA_FILES[type];
    
    if (!filename) {
      return res.status(400).json({ error: 'Invalid data type' });
    }
    
    await writeDataFile(filename, req.body);
    res.json({ success: true });
  } catch (error) {
    console.error('Error writing data:', error);
    res.status(500).json({ error: 'Failed to write data' });
  }
});

// Export all data
app.get('/api/export', async (req, res) => {
  try {
    const exportData = {};
    
    for (const [type, filename] of Object.entries(DATA_FILES)) {
      exportData[type] = await readDataFile(filename);
    }
    
    res.json(exportData);
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Import data
app.post('/api/import', async (req, res) => {
  try {
    const data = req.body;
    
    for (const [type, content] of Object.entries(data)) {
      const filename = DATA_FILES[type];
      if (filename) {
        await writeDataFile(filename, content);
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error importing data:', error);
    res.status(500).json({ error: 'Failed to import data' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Initialize and start server
async function start() {
  await ensureDataDir();
  
  app.listen(PORT, () => {
    console.log(`🚀 Backend server running on port ${PORT}`);
    console.log(`📁 Data directory: ${DATA_DIR}`);
  });
}

start().catch(console.error);
