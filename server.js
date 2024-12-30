import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

const filePath = './fastingHistory.json';

// Create the file if it doesn't exist
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, '[]');
}

// Load history from file
app.get('/history', (req, res) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading history:', err);
      return res.status(500).json({ error: 'Failed to load history' });
    }
    res.json(JSON.parse(data || '[]'));
  });
});

// Save new history
app.post('/history', (req, res) => {
  const newHistory = req.body;
  fs.writeFile(filePath, JSON.stringify(newHistory, null, 2), (err) => {
    if (err) {
      console.error('Error saving history:', err);
      return res.status(500).json({ error: 'Failed to save history' });
    }
    res.status(200).json({ message: 'History saved successfully' });
  });
});

// Error handling for server start
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