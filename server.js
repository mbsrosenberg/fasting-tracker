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

// Data file paths
const DATA_DIR = path.join(process.cwd(), 'data');
const FASTING_HISTORY_PATH = path.join(DATA_DIR, 'fastingHistory.json');
const BACKUP_PATH = path.join(DATA_DIR, 'fastingHistory.backup.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

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
      const data = fs.readFileSync(FASTING_HISTORY_PATH, 'utf8');
      return JSON.parse(data);
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
    const sortedHistory = history.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    fs.writeFileSync(FASTING_HISTORY_PATH, JSON.stringify(sortedHistory, null, 2));
    // Create backup
    fs.writeFileSync(BACKUP_PATH, JSON.stringify(sortedHistory, null, 2));
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
    res.status(500).json({ error: 'Failed to load history' });
  }
});

app.post('/api/history', (req, res) => {
  try {
    const session = req.body;
    const validationErrors = validateFastingSession(session);
    
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    const history = readHistory();
    history.unshift(session);
    
    if (writeHistory(history)) {
      res.status(200).json({ message: 'Session saved successfully' });
    } else {
      res.status(500).json({ error: 'Failed to save session' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to process request' });
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