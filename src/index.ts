import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import responseRoutes from "./routes/responseRoutes.js";
import mongoResponseRoutes from "./routes/mongoResponseRoutes.js";
import { connectMongoDB } from "./db/mongodb/connection.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests

// Routes — PostgreSQL
app.use("/api/responses", responseRoutes);

// Routes — MongoDB
app.use("/api/mongo/responses", mongoResponseRoutes);

// Health Check Endpoint
app.get("/health", (req, res) => {
  res
    .status(200)
    .json({ status: "ok", message: "Persistent Forms API is running" });
});

// Connect to MongoDB, then start the server
connectMongoDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
