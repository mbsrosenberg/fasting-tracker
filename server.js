import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Use an absolute path outside of the project directory
const filePath = process.env.NODE_ENV === 'production'
  ? '/tmp/fastingHistory.json'  // For Vercel
  : path.join(process.env.HOME || process.env.USERPROFILE, '.fastingHistory.json'); // For local development

// Initialize history file with existing data
const initializeHistoryFile = () => {
  try {
    if (!fs.existsSync(filePath)) {
      // Check for backup first
      if (fs.existsSync(`${filePath}.backup`)) {
        const backupData = fs.readFileSync(`${filePath}.backup`, 'utf8');
        fs.writeFileSync(filePath, backupData);
        console.log('Restored history from backup');
        return;
      }
      // Create new file if no backup exists
      fs.writeFileSync(filePath, '[]', 'utf8');
      console.log('Created new history file');
    }
  } catch (error) {
    console.error('Error initializing history file:', error);
  }
};

initializeHistoryFile();

// Backup the history file periodically
const backupHistory = () => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const backupPath = `${filePath}.backup`;
    fs.writeFileSync(backupPath, data);
    console.log('History backup created successfully');
  } catch (error) {
    console.error('Error creating backup:', error);
  }
};

// Backup every hour
setInterval(backupHistory, 3600000);

app.get('/api/history', (req, res) => {
  try {
    let data = '[]';
    if (fs.existsSync(filePath)) {
      data = fs.readFileSync(filePath, 'utf8');
    } else if (fs.existsSync(`${filePath}.backup`)) {
      data = fs.readFileSync(`${filePath}.backup`, 'utf8');
      // Restore main file from backup
      fs.writeFileSync(filePath, data);
    }
    const history = JSON.parse(data);
    // Sort history by completedAt in descending order
    history.sort((a, b) => b.completedAt - a.completedAt);
    res.json(history);
  } catch (error) {
    console.error('Error reading history:', error);
    res.status(500).json({ error: 'Failed to load history' });
  }
});

app.post('/api/history', (req, res) => {
  try {
    const newHistory = req.body;
    // Ensure history is an array and sort it
    const sortedHistory = Array.isArray(newHistory) 
      ? newHistory.sort((a, b) => b.completedAt - a.completedAt)
      : [];
    
    fs.writeFileSync(filePath, JSON.stringify(sortedHistory, null, 2));
    backupHistory(); // Create backup after successful write
    res.status(200).json({ message: 'History saved successfully' });
  } catch (error) {
    console.error('Error saving history:', error);
    res.status(500).json({ error: 'Failed to save history' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

const startServer = async () => {
  try {
    await new Promise((resolve, reject) => {
      const server = app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        resolve();
      });

      server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          console.error(`Port ${PORT} is already in use. Please try a different port.`);
        } else {
          console.error('Server error:', error);
        }
        reject(error);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app; 