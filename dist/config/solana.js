"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", { value: true });
exports.solConfig = void 0;
const anchor_1 = require("@project-serum/anchor");
const bytes_1 = require("@project-serum/anchor/dist/cjs/utils/bytes");
const web3_js_1 = require("@solana/web3.js");
const idl_json_1 = __importDefault(require("../../idl.json"));
// import { Wallet } from "@coral-xyz/anchor";
// dotenv.config();
const commitmentLevel = "confirmed";
// const endPoint = clusterApiUrl("devnet");
const endPoint = "https://devnet.helius-rpc.com/?api-key=fbd71cb2-44d9-42a6-854e-58dee9c02ce8";
// "https://rpc.ankr.com/solana_devnet";
// let connection;
const connection = new web3_js_1.Connection(endPoint, commitmentLevel);
try {
}
catch (error) { }
const botKeypair = web3_js_1.Keypair.fromSecretKey(bytes_1.bs58.decode((_a = process.env.BOT_PRIVATE_KEY) !== null && _a !== void 0 ? _a : "3B46jpFhDgzuXQMfNmDNG9ZV1UuqerqLH1ySpc2nNXb8GtusdniXSjKSXrtoBhtNEJzMRTTHRbgwJ1wX77MYkj6m"));
const botWallet = new anchor_1.Wallet(botKeypair);
exports.solConfig = {
    endPoint: endPoint,
    connection: connection,
    PROGRAM_ID: new web3_js_1.PublicKey((_b = process.env.PROGRAM_ID) !== null && _b !== void 0 ? _b : "2DEZqmLrsD1Z49TmrwXmqf8nS1PEea6niR1RaY4kLaqS"),
    PRESALE_SEED: (_c = process.env.PRESALE_SEED) !== null && _c !== void 0 ? _c : "PRESALE_SEED",
    PRESALE_VAULT: (_d = process.env.PRESALE_VAULT) !== null && _d !== void 0 ? _d : "PRESALE_VAULT",
    PRESALE_TEST_WALLET: new web3_js_1.PublicKey((_e = process.env.PRESALE_TEST_WALLET) !== null && _e !== void 0 ? _e : "eiFU5aUhAvFASa1R9LsQREUqv1ByJqPRr4iy6WrwBZh"),
    USER_SEED: (_f = process.env.USER_SEED) !== null && _f !== void 0 ? _f : "USER_SEED",
    TOKEN_PROGRAM_ID: new web3_js_1.PublicKey((_g = process.env.TOKEN_PROGRAM_ID) !== null && _g !== void 0 ? _g : "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"),
    // TOKEN_ADDRESS: new PublicKey(process.env.TOKEN_ADDRESS),
    ADMIN_WALLET: new web3_js_1.PublicKey((_h = process.env.ADMIN_WALLET) !== null && _h !== void 0 ? _h : "BY6f8AuhiN53qGegReuaK2kh2rU45ab8hqSaiwYcM1vm"),
    idl: idl_json_1.default,
    //   PRESALE_AUTHORITY: new PublicKey(process.env.PRESALE_AUTHORITY ?? ""),
    BOT_KEYPAIR: botKeypair,
    BOT_WALLET: botWallet,
};
