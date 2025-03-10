import express, { Request, Response } from "express";
import { PublicKey } from "@solana/web3.js";
import { botBuy } from "../utils/buyBot";
import axios from "axios";
import cron, { ScheduledTask } from "node-cron";

const router = express.Router();

// Track global active state and job instance
let isActive = false;
let cronJob: ScheduledTask | null = null;
let currentConfig: {
  timeFrequency?: number;
  presaleAuthority?: string;
  amount?: number;
} = {};

// Function to send Telegram notification
const sendTelegramNotification = async (tx: string): Promise<void> => {
  try {
    await axios.post(
      "https://api.telegram.org/bot7572995813:AAF-jUEn5IIxJDNwuPR_3Q1eRnooazN6iBQ/sendMessage",
      {
        chat_id: "-1002256261180",
        text: `https://solscan.io/tx/${tx}?cluster=devnet`,
      }
    );
  } catch (error) {
    console.error("Error sending Telegram notification:", error);
  }
};

// GET endpoint to manage automated buying
router.get("/bot", async (req: any, res: any) => {
  try {
    // Extract parameters from query string
    const requestIsActive = req.query.isActive === "true";
    const timeFrequency = req.query.timeFrequency
      ? parseInt(req.query.timeFrequency as string)
      : undefined;
    const presaleAuthority = req.query.presaleAuthority as string | undefined;
    const amount = req.query.amount
      ? parseFloat(req.query.amount as string)
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
        message:
          "Automated buying bot is already active with the same configuration",
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
          message:
            "Missing required parameters: timeFrequency, presaleAuthority and amount are required for activation",
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
  } catch (error: any) {
    console.error("Error in automatedBuying endpoint:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Helper function to start the bot with given configuration
const startBot = (config: typeof currentConfig, res: Response) => {
  try {
    const { timeFrequency, presaleAuthority, amount } = config;

    if (!timeFrequency || !presaleAuthority || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required configuration parameters",
      });
    }

    // Convert presaleAuthority to PublicKey
    const presaleAuthorityPubkey = new PublicKey(presaleAuthority);

    // Convert timeFrequency to cron expression (assuming timeFrequency is in minutes)
    const cronExpression = `*/${timeFrequency} * * * *`;

    // Create and schedule the job
    cronJob = cron.schedule(cronExpression, async () => {
      try {
        console.log(
          `Executing automated buying at ${new Date().toISOString()}`
        );

        // Execute the buyToken function
        const result = await botBuy(presaleAuthorityPubkey, amount);

        // Log the result
        console.log("Execution result:", result);

        // Send Telegram notification if transaction was successful
        if (result.success && result.signature) {
          await sendTelegramNotification(result.signature);
        }
      } catch (error) {
        console.error("Error executing automated buying:", error);
      }
    });

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
  } catch (error: any) {
    console.error("Error starting bot:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to start bot",
      error: error.message,
    });
  }
};

// GET endpoint to check bot status
router.get("/bot/status", (req: any, res: any) => {
  return res.status(200).json({
    success: true,
    isActive,
    config: isActive ? currentConfig : null,
  });
});

export default router;
