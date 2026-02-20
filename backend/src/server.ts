// Load environment variables FIRST
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { connectDatabase } from "./config/database";
import app from "./app";

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDatabase();

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
});
