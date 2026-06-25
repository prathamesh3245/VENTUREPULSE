// const express = require("express");
// const cors = require("cors");
// const connectDB = require("./config/database");


// connectDB();

// const app = express();
// app.use(cors());
// app.use(express.json());


// app.get("/health", (req, res) => {
//   res.json({ status: "OK", message: "VenturePulse API is running" });
// });










// const PORT = process.env.PORT || 3000;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
//   console.log(`Health check: http://localhost:${PORT}/health`);
// });


const express = require("express");
const cors = require("cors");
const path = require("path"); // 👈 Add this for serving static files
const connectDB = require("./config/database");

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "VenturePulse API is running" });
});

// ---------------------- ADD THIS: Serve Frontend ----------------------
// Serve static files from the React frontend in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the frontend build
  app.use(express.static(path.join(__dirname, 'frontend/dist')));
  
  // For any route not handled by the API, serve the React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
  });
}
// ---------------------- END OF FRONTEND SERVING ----------------------

// You would add your other API routes here...
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/startup', require('./routes/startup'));
// etc.

// Server setup - SINGLE instance (removed duplicate)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
