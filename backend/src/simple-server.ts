import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Simple Casa Hub Backend is running',
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Casa Hub Backend API',
    version: '1.0.0',
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});