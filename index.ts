import { Request, Response } from "express";

const express = require("express");
const app = express();
const PORT = process.env.PORT || 3003;
import botRoutes from "./routes/bot";
// const router = require("./routes/bot");

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "API is working!" });
});
// API route
app.get("/api/data", (req: Request, res: Response) => {
  res.json({ message: "API is working!" });
});

app.use("/api", botRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
