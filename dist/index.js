"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bot_1 = __importDefault(require("./routes/bot"));
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3003;
// const router = require("./routes/bot");
app.use(express.json());
app.get("/", (req, res) => {
    res.json({ message: "API is working!" });
});
// API route
app.get("/api/data", (req, res) => {
    res.json({ message: "API is working!" });
});
app.use("/api", bot_1.default);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
