const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");


connectDB();

const app = express();
app.use(cors());
app.use(express.json());


app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "VenturePulse API is running" });
});










const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});



