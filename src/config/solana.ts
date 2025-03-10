import { clusterApiUrl, Connection, Keypair, PublicKey } from "@solana/web3.js";
import idl from "../../idl.json";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { Wallet } from "@project-serum/anchor";
// import { Wallet } from "@coral-xyz/anchor";
import dotenv from "dotenv";
// dotenv.config();

const commitmentLevel = "confirmed";
// const endPoint = clusterApiUrl("devnet");
const endPoint =
  "https://devnet.helius-rpc.com/?api-key=fbd71cb2-44d9-42a6-854e-58dee9c02ce8";
// "https://rpc.ankr.com/solana_devnet";
// let connection;
const connection = new Connection(endPoint, commitmentLevel);
try {
} catch (error) {}

const botKeypair = Keypair.fromSecretKey(
  bs58.decode(
    process.env.BOT_PRIVATE_KEY ??
      "3B46jpFhDgzuXQMfNmDNG9ZV1UuqerqLH1ySpc2nNXb8GtusdniXSjKSXrtoBhtNEJzMRTTHRbgwJ1wX77MYkj6m"
  )
);
const botWallet = new Wallet(botKeypair);

export const solConfig = {
  endPoint: endPoint,
  connection: connection,
  PROGRAM_ID: new PublicKey(
    process.env.PROGRAM_ID ?? "FhnmdDRURZHstrVCah8RpE5viGYzhakz4L6gsTCangs5"
  ),
  PRESALE_SEED: process.env.PRESALE_SEED ?? "PRESALE_SEED",
  PRESALE_VAULT: process.env.PRESALE_VAULT ?? "PRESALE_VAULT",
  PRESALE_TEST_WALLET: new PublicKey(
    process.env.PRESALE_TEST_WALLET ??
      "eiFU5aUhAvFASa1R9LsQREUqv1ByJqPRr4iy6WrwBZh"
  ),
  USER_SEED: process.env.USER_SEED ?? "USER_SEED",
  TOKEN_PROGRAM_ID: new PublicKey(
    process.env.TOKEN_PROGRAM_ID ??
      "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
  ),
  // TOKEN_ADDRESS: new PublicKey(process.env.TOKEN_ADDRESS),
  ADMIN_WALLET: new PublicKey(
    process.env.ADMIN_WALLET ?? "BY6f8AuhiN53qGegReuaK2kh2rU45ab8hqSaiwYcM1vm"
  ),
  idl: idl,
  //   PRESALE_AUTHORITY: new PublicKey(process.env.PRESALE_AUTHORITY ?? ""),
  BOT_KEYPAIR: botKeypair,
  BOT_WALLET: botWallet,
};
