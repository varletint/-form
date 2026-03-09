import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import responseRoutes from "./routes/responseRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests

// Routes
app.use("/api/responses", responseRoutes);

// Health Check Endpoint
app.get("/health", (req, res) => {
  res
    .status(200)
    .json({ status: "ok", message: "Persistent Forms API is running" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
