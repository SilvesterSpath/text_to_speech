import express from 'express';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable JSON parsing (Fixes req.body undefined issue)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Resolve correct paths
const __dirname = path.resolve();

// Serve frontend (public folder)
app.use(express.static(path.join(__dirname, 'public')));

// API Route for Translation (uses api/translation.js)
import { translateText } from '../api/translation.js';

app.post('/translate', async (req, res) => {
  const { text, targetLang } = req.body;

  if (!text || !targetLang) {
    return res.status(400).json({ error: 'Missing text or targetLang' });
  }

  try {
    const translatedText = await translateText(text, targetLang);
    res.json({ translation: translatedText });
  } catch (error) {
    console.error('Translation failed:', error);
    res.status(500).json({ error: 'Translation failed.' });
  }
});

// Serve frontend on all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
