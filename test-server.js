#!/usr/bin/env node
import 'dotenv/config';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 4000;

app.get('/test', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`✅ Test server listening on http://localhost:${PORT}`);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.log('Test server ready');
}, 1000);
