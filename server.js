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

// Data file paths - Use an absolute path that persists between deployments
const DATA_DIR = process.env.NODE_ENV === 'production'
  ? path.join(process.cwd(), '../data') // Store outside the deployment directory
  : path.join(process.cwd(), 'data');

const FASTING_HISTORY_PATH = path.join(DATA_DIR, 'fastingHistory.json');
const BACKUP_PATH = path.join(DATA_DIR, 'fastingHistory.backup.json');

// Ensure data directory exists and initialize files
const initializeDataStorage = () => {
  try {
    // Create data directory if it doesn't exist
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // Initialize history file if it doesn't exist
    if (!fs.existsSync(FASTING_HISTORY_PATH)) {
      // Check for backup first
      if (fs.existsSync(BACKUP_PATH)) {
        fs.copyFileSync(BACKUP_PATH, FASTING_HISTORY_PATH);
      } else {
        fs.writeFileSync(FASTING_HISTORY_PATH, '[]', 'utf8');
      }
    }
  } catch (error) {
    console.error('Error initializing data storage:', error);
  }
};

initializeDataStorage();

// Add automatic backup every hour
setInterval(() => {
  try {
    if (fs.existsSync(FASTING_HISTORY_PATH)) {
      fs.copyFileSync(FASTING_HISTORY_PATH, BACKUP_PATH);
      console.log('Backup created successfully');
    }
  } catch (error) {
    console.error('Backup failed:', error);
  }
}, 3600000); // 1 hour

// Data validation
const validateFastingSession = (session) => {
  const requiredFields = ['type', 'duration', 'completedAt', 'startTime'];
  const errors = [];

  for (const field of requiredFields) {
    if (!session[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  return errors;
};

// Data management functions
const readHistory = () => {
  try {
    if (fs.existsSync(FASTING_HISTORY_PATH)) {
      return JSON.parse(fs.readFileSync(FASTING_HISTORY_PATH, 'utf8'));
    }
    if (fs.existsSync(BACKUP_PATH)) {
      const data = fs.readFileSync(BACKUP_PATH, 'utf8');
      fs.writeFileSync(FASTING_HISTORY_PATH, data);
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error reading history:', error);
    return [];
  }
};

const writeHistory = (history) => {
  try {
    fs.writeFileSync(FASTING_HISTORY_PATH, JSON.stringify(history, null, 2));
    // Create immediate backup
    fs.copyFileSync(FASTING_HISTORY_PATH, BACKUP_PATH);
    return true;
  } catch (error) {
    console.error('Error writing history:', error);
    return false;
  }
};

// Analytics functions
const calculateStreak = (history) => {
  if (!history.length) return 0;
  
  const today = new Date().setHours(0, 0, 0, 0);
  let streak = 0;
  let currentDate = today;
  
  for (const fast of history) {
    const fastDate = new Date(fast.endTime).setHours(0, 0, 0, 0);
    if (fastDate === currentDate) {
      streak++;
      currentDate -= 86400000; // Subtract one day in milliseconds
    } else if (fastDate < currentDate) {
      break;
    }
  }
  
  return streak;
};

const getAnalytics = (history) => {
  if (!history.length) {
    return {
      currentStreak: 0,
      totalFasts: 0,
      averageDuration: 0,
      longestFast: 0,
      completionRate: 0
    };
  }

  const totalFasts = history.length;
  const currentStreak = calculateStreak(history);
  const durations = history.map(fast => parseInt(fast.duration));
  const averageDuration = durations.reduce((a, b) => a + b, 0) / totalFasts;
  const longestFast = Math.max(...durations);
  const completedFasts = history.filter(fast => fast.completed).length;
  const completionRate = (completedFasts / totalFasts) * 100;

  return {
    currentStreak,
    totalFasts,
    averageDuration,
    longestFast,
    completionRate
  };
};

// API Routes
app.get('/api/history', (req, res) => {
  try {
    const history = readHistory();
    res.json(history);
  } catch (error) {
    console.error('Error serving history:', error);
    res.status(500).json({ error: 'Failed to load history' });
  }
});

app.post('/api/history', (req, res) => {
  try {
    const newHistory = req.body;
    if (writeHistory(newHistory)) {
      res.status(200).json({ message: 'History saved successfully' });
    } else {
      res.status(500).json({ error: 'Failed to save history' });
    }
  } catch (error) {
    console.error('Error saving history:', error);
    res.status(500).json({ error: 'Failed to save history' });
  }
});

app.get('/api/analytics', (req, res) => {
  try {
    const history = readHistory();
    const analytics = getAnalytics(history);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate analytics' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app; 