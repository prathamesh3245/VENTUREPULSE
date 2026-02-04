const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");
const authRoutes = require("./routes/auth");
const { authenticate, verifySEBI, verifyStartup } = require("./middleware/auth");

// Connect to database
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "VenturePulse API is running" });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Protected prediction endpoint - requires authentication
app.post("/getPredict", authenticate, async (req, res) => {
    try {
        const response = await fetch("http://localhost:5000/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req.body),
        });
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get prediction" });
    }
});

// Protected endpoint for investment bankers only
app.get("/api/investment-banker/dashboard", authenticate, verifySEBI, (req, res) => {
    res.json({ 
        message: "Investment Banker Dashboard",
        user: req.user 
    });
});

// Protected endpoint for startups only
app.get("/api/startup/dashboard", authenticate, verifyStartup, (req, res) => {
    res.json({ 
        message: "Startup Dashboard",
        user: req.user 
    });
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Handle server errors gracefully
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please stop the existing server or use a different port.`);
    console.error(`To find and kill the process using port ${PORT}, run: netstat -ano | findstr :${PORT}`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});
