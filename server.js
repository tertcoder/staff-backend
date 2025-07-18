require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/staff", require("./routes/staffRoutes"));

// Basic route
app.get("/", (req, res) => {
  res.send("Staff Management API is running...");
});

module.exports = app;
