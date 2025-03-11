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
const web3_js_1 = require("@solana/web3.js");
const axios_1 = __importDefault(require("axios"));
const express_1 = __importDefault(require("express"));
const node_cron_1 = __importDefault(require("node-cron"));
const buyBot_1 = require("../utils/buyBot");
const router = express_1.default.Router();
// Track global active state and job instance
let isActive = false;
let cronJob = null;
let currentConfig = {};
// Function to send Telegram notification
const sendTelegramNotification = (tx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield axios_1.default.post("https://api.telegram.org/bot7572995813:AAF-jUEn5IIxJDNwuPR_3Q1eRnooazN6iBQ/sendMessage", {
            chat_id: "-1002256261180",
            text: `https://solscan.io/tx/${tx}?cluster=devnet`,
        });
    }
    catch (error) {
        console.error("Error sending Telegram notification:", error);
    }
});
// GET endpoint to manage automated buying
router.get("/bot", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Extract parameters from query string
        const requestIsActive = req.query.isActive === "true";
        const timeFrequency = req.query.timeFrequency
            ? parseInt(req.query.timeFrequency)
            : undefined;
        const presaleAuthority = req.query.presaleAuthority;
        const amount = req.query.amount
            ? parseFloat(req.query.amount)
            : undefined;
        // Check if isActive is properly provided
        if (req.query.isActive === undefined) {
            return res.status(400).json({
                success: false,
                message: "isActive flag must be provided as true or false",
            });
        }
        // Check current state vs requested state
        if (isActive === true && requestIsActive === true) {
            // If new parameters are provided, update the configuration and restart the cron job
            if (timeFrequency || presaleAuthority || amount) {
                // Stop existing cron job
                if (cronJob) {
                    cronJob.stop();
                    cronJob = null;
                }
                // Update configuration with new values or retain existing ones
                currentConfig = {
                    timeFrequency: timeFrequency || currentConfig.timeFrequency,
                    presaleAuthority: presaleAuthority || currentConfig.presaleAuthority,
                    amount: amount || currentConfig.amount,
                };
                // Create and start new cron job with updated config
                return startBot(currentConfig, res);
            }
            return res.status(400).json({
                success: false,
                message: "Automated buying bot is already active with the same configuration",
            });
        }
        if (isActive === false && requestIsActive === false) {
            return res.status(400).json({
                success: false,
                message: "Automated buying bot is already inactive",
            });
        }
        // Handling activation request
        if (requestIsActive === true) {
            // Validate required parameters for activation
            if (!timeFrequency || !presaleAuthority || !amount) {
                return res.status(400).json({
                    success: false,
                    message: "Missing required parameters: timeFrequency, presaleAuthority and amount are required for activation",
                });
            }
            // Store current configuration
            currentConfig = {
                timeFrequency,
                presaleAuthority,
                amount,
            };
            return startBot(currentConfig, res);
        }
        // Handling deactivation request
        else {
            // Stop the cron job if it exists
            if (cronJob) {
                cronJob.stop();
                cronJob = null;
            }
            // Update global state
            isActive = false;
            return res.status(200).json({
                success: true,
                message: "Automated buying bot stopped successfully",
            });
        }
    }
    catch (error) {
        console.error("Error in automatedBuying endpoint:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}));
// Helper function to start the bot with given configuration
const startBot = (config, res) => {
    try {
        const { timeFrequency, presaleAuthority, amount } = config;
        if (!timeFrequency || !presaleAuthority || !amount) {
            return res.status(400).json({
                success: false,
                message: "Missing required configuration parameters",
            });
        }
        // Convert presaleAuthority to PublicKey
        const presaleAuthorityPubkey = new web3_js_1.PublicKey(presaleAuthority);
        // Convert timeFrequency to cron expression (assuming timeFrequency is in minutes)
        const cronExpression = `*/${timeFrequency} * * * *`;
        // Create and schedule the job
        cronJob = node_cron_1.default.schedule(cronExpression, () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                console.log(`Executing automated buying at ${new Date().toISOString()}`);
                // Execute the buyToken function
                const result = yield (0, buyBot_1.botBuy)(presaleAuthorityPubkey, amount);
                // Log the result
                console.log("Execution result:", result);
                // Send Telegram notification if transaction was successful
                if (result.success && result.signature) {
                    yield sendTelegramNotification(result.signature);
                }
            }
            catch (error) {
                console.error("Error executing automated buying:", error);
            }
        }));
        // Start the job immediately
        cronJob.start();
        // Update global state
        isActive = true;
        // Return success response
        return res.status(200).json({
            success: true,
            message: "Automated buying bot started successfully",
            schedule: {
                frequency: `${timeFrequency} minutes`,
                cronExpression,
            },
            configuration: {
                timeFrequency,
                presaleAuthority: presaleAuthority,
                amount,
            },
        });
    }
    catch (error) {
        console.error("Error starting bot:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to start bot",
            error: error.message,
        });
    }
};
// GET endpoint to check bot status
router.get("/bot/status", (req, res) => {
    return res.status(200).json({
        success: true,
        isActive,
        config: isActive ? currentConfig : null,
    });
});
exports.default = router;
