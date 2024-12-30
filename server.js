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

const filePath = path.join(__dirname, 'fastingHistory.json');

// Create the file if it doesn't exist
try {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]', 'utf8');
  }
} catch (error) {
  console.error('Error creating history file:', error);
}

// API routes
app.get('/api/history', (req, res) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading history:', err);
      return res.status(500).json({ error: 'Failed to load history' });
    }
    res.json(JSON.parse(data || '[]'));
  });
});

app.post('/api/history', (req, res) => {
  const newHistory = req.body;
  fs.writeFile(filePath, JSON.stringify(newHistory, null, 2), (err) => {
    if (err) {
      console.error('Error saving history:', err);
      return res.status(500).json({ error: 'Failed to save history' });
    }
    res.status(200).json({ message: 'History saved successfully' });
  });
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