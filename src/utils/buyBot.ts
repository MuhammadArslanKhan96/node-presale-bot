import { solConfig } from "../config/solana";
import {
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  LAMPORTS_PER_SOL,
  Connection,
  clusterApiUrl,
  PublicKey,
  Keypair,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  getPresalePDA,
  getUserInfoPDA,
  getVaultPDA,
  getSuperPresalePDA,
} from "../utils/helpers";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import * as anchor from "@project-serum/anchor";

interface BotBuyResult {
  success: boolean;
  signature?: string;
  message: string;
}

export const botBuy = async (
  presaleAuthority: PublicKey,
  quoteAmount: number
): Promise<BotBuyResult> => {
  // Convert private key string to Uint8Array and create keypair
  const wallet = solConfig.BOT_KEYPAIR.publicKey;
  const walletKeypair = solConfig.BOT_KEYPAIR;

  console.log(presaleAuthority.toBase58(), "presale auth");
  const idlFile: any = solConfig.idl;
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // Create provider with keypair
  const provider = new anchor.AnchorProvider(
    connection,
    {
      publicKey: wallet,
      signTransaction: async (tx: Transaction) => {
        tx.partialSign(walletKeypair);
        return tx;
      },
      signAllTransactions: async (txs: Transaction[]) => {
        return txs.map((tx) => {
          tx.partialSign(walletKeypair);
          return tx;
        });
      },
    },
    { commitment: "confirmed" }
  );

  // Initialize the program
  const program = new anchor.Program(idlFile, solConfig.PROGRAM_ID, provider);

  // Get PDAs
  const [userInfo] = await getUserInfoPDA(wallet, presaleAuthority);
  const [presaleVault] = await getVaultPDA(presaleAuthority);
  const [presalePDA] = await getPresalePDA(presaleAuthority);
  const [superPresaleInfo] = getSuperPresalePDA();

  console.log(quoteAmount, wallet.toBase58());
  console.log(
    "\npresaleInfo:",
    presalePDA.toBase58(),
    "\npresaleAuthority:",
    presaleAuthority.toBase58(),
    "\nuserInfo:",
    userInfo.toBase58(),
    "\npresaleVault:",
    presaleVault.toBase58(),
    "\nbuyer:",
    wallet.toBase58(),
    "\nrent:",
    SYSVAR_RENT_PUBKEY.toBase58(),
    "\nsystemProgram:",
    SystemProgram.programId.toBase58(),
    "\ntokenProgram:",
    TOKEN_2022_PROGRAM_ID.toBase58(),
    "\nassociatedTokenProgram:",
    ASSOCIATED_TOKEN_PROGRAM_ID.toBase58()
  );

  // Convert quote amount to lamports
  const quoteLamports = quoteAmount * LAMPORTS_PER_SOL;
  console.log(quoteLamports);

  try {
    // Build the transaction
    const transaction = await program.methods
      .buyToken(new anchor.BN(JSON.stringify(quoteLamports)))
      .accounts({
        presaleInfo: presalePDA,
        presaleAuthority: presaleAuthority,
        superAdmin: presaleAuthority,
        superPresaleInfo: superPresaleInfo,
        userInfo: userInfo,
        presaleVault: presaleVault,
        buyer: wallet,
        rent: SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .transaction();

    // Sign and send the transaction
    const signature = await sendAndConfirmTransaction(connection, transaction, [
      walletKeypair,
    ]);

    console.log(
      "Bought tokens successful: ",
      `https://explorer.solana.com/tx/${signature}?cluster=devnet`
    );
    // console.log( await sendTelegramMessage(signature))

    return {
      success: true,
      signature,
      message: `Bought tokens successfully: https://explorer.solana.com/tx/${signature}?cluster=devnet`,
    };
  } catch (error: any) {
    console.error("could not buy tokens: ", error.message);
    return {
      success: false,
      message: `Failed to buy tokens: ${error.message}`,
    };
  }
};
