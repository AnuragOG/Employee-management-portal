const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/services', require('./routes/services'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/service-requests', require('./routes/serviceRequests'));
app.use('/api/dashboard', require('./routes/dashboard'));

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000 // Stop trying after 5 seconds
})
.then(() => {
  console.log("MongoDB Connected...");
  // Start server ONLY after DB is ready
  app.listen(PORT, () => console.log(`Server on port ${PORT}`));
})
.catch(err => {
  console.error("Database connection error:", err.message);
  // Start the server anyway so Render sees it's "live," 
  // or let it crash with a clear message.
  process.exit(1); 
});
