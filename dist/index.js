"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
exports.default = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    app(req, res);
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
