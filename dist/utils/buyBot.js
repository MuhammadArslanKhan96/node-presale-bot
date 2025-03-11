"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.botBuy = void 0;
const solana_1 = require("../config/solana");
const web3_js_1 = require("@solana/web3.js");
const helpers_1 = require("../utils/helpers");
const spl_token_1 = require("@solana/spl-token");
const anchor = __importStar(require("@project-serum/anchor"));
const botBuy = (presaleAuthority, quoteAmount) => __awaiter(void 0, void 0, void 0, function* () {
    // Convert private key string to Uint8Array and create keypair
    const wallet = solana_1.solConfig.BOT_KEYPAIR.publicKey;
    const walletKeypair = solana_1.solConfig.BOT_KEYPAIR;
    console.log(presaleAuthority.toBase58(), "presale auth");
    const idlFile = solana_1.solConfig.idl;
    const connection = new web3_js_1.Connection((0, web3_js_1.clusterApiUrl)("devnet"), "confirmed");
    // Create provider with keypair
    const provider = new anchor.AnchorProvider(connection, {
        publicKey: wallet,
        signTransaction: (tx) => __awaiter(void 0, void 0, void 0, function* () {
            tx.partialSign(walletKeypair);
            return tx;
        }),
        signAllTransactions: (txs) => __awaiter(void 0, void 0, void 0, function* () {
            return txs.map((tx) => {
                tx.partialSign(walletKeypair);
                return tx;
            });
        }),
    }, { commitment: "confirmed" });
    // Initialize the program
    const program = new anchor.Program(idlFile, solana_1.solConfig.PROGRAM_ID, provider);
    // Get PDAs
    const [userInfo] = yield (0, helpers_1.getUserInfoPDA)(wallet, presaleAuthority);
    const [presaleVault] = yield (0, helpers_1.getVaultPDA)(presaleAuthority);
    const [presalePDA] = yield (0, helpers_1.getPresalePDA)(presaleAuthority);
    const [superPresaleInfo] = (0, helpers_1.getSuperPresalePDA)();
    console.log(quoteAmount, wallet.toBase58());
    console.log("\npresaleInfo:", presalePDA.toBase58(), "\npresaleAuthority:", presaleAuthority.toBase58(), "\nuserInfo:", userInfo.toBase58(), "\npresaleVault:", presaleVault.toBase58(), "\nbuyer:", wallet.toBase58(), "\nrent:", web3_js_1.SYSVAR_RENT_PUBKEY.toBase58(), "\nsystemProgram:", web3_js_1.SystemProgram.programId.toBase58(), "\ntokenProgram:", spl_token_1.TOKEN_2022_PROGRAM_ID.toBase58(), "\nassociatedTokenProgram:", spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID.toBase58());
    // Convert quote amount to lamports
    const quoteLamports = quoteAmount * web3_js_1.LAMPORTS_PER_SOL;
    console.log(quoteLamports);
    try {
        // Build the transaction
        const transaction = yield program.methods
            .buyToken(new anchor.BN(JSON.stringify(quoteLamports)))
            .accounts({
            presaleInfo: presalePDA,
            presaleAuthority: presaleAuthority,
            superAdmin: presaleAuthority,
            superPresaleInfo: superPresaleInfo,
            userInfo: userInfo,
            presaleVault: presaleVault,
            buyer: wallet,
            rent: web3_js_1.SYSVAR_RENT_PUBKEY,
            systemProgram: web3_js_1.SystemProgram.programId,
            tokenProgram: spl_token_1.TOKEN_2022_PROGRAM_ID,
            associatedTokenProgram: spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
        })
            .transaction();
        // Sign and send the transaction
        const signature = yield (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, [
            walletKeypair,
        ]);
        console.log("Bought tokens successful: ", `https://explorer.solana.com/tx/${signature}?cluster=devnet`);
        // console.log( await sendTelegramMessage(signature))
        return {
            success: true,
            signature,
            message: `Bought tokens successfully: https://explorer.solana.com/tx/${signature}?cluster=devnet`,
        };
    }
    catch (error) {
        console.error("could not buy tokens: ", error.message);
        return {
            success: false,
            message: `Failed to buy tokens: ${error.message}`,
        };
    }
});
exports.botBuy = botBuy;
