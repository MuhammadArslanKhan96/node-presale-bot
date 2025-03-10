// import { adminKeyPair, connection, privateKey, programID } from "@/constants";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
// import { AnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { solConfig } from "../config/solana";
export const PRESALE_SEED = "PRESALE_SEED";
export const PRESALE_VAULT = "PRESALE_VAULT";
export const USER_SEED = "USER_SEED";
import * as anchor from "@project-serum/anchor";

// const progId = new PublicKey("6RdWeathhyGS625o2yAMabLEhyN3WasXfAbR3Hw7CnS9");

export const getSuperPresalePDA = () => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(PRESALE_SEED)],
    solConfig.PROGRAM_ID
  );
};

export const getPresalePDA = (wallet: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(PRESALE_SEED), wallet.toBuffer()],
    solConfig.PROGRAM_ID
    // progId
  );
};

export const getUserInfoPDA = async (wallet: PublicKey, admin: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(USER_SEED), wallet.toBuffer(), admin.toBuffer()],
    solConfig.PROGRAM_ID
  );
};

export const getVaultPDA = async (wallet: PublicKey) => {
  return await PublicKey.findProgramAddressSync(
    [Buffer.from(PRESALE_VAULT), wallet.toBuffer()],
    solConfig.PROGRAM_ID
  );
};

export async function getAdminAta(tokenAddress: PublicKey) {
  const adminAta = (
    await getOrCreateAssociatedTokenAccount(
      solConfig.connection,
      solConfig.BOT_KEYPAIR,
      tokenAddress,
      solConfig.BOT_KEYPAIR.publicKey
    )
  ).address;
  console.log("adminAta: ", adminAta.toBase58());
  return adminAta;
}

export async function getPresaleData(wallet: PublicKey) {
  const [presalePda] = getPresalePDA(wallet);

  let provider: any;
  // const anchorWallet = new anchor.a();
  try {
    provider = new anchor.AnchorProvider(
      solConfig.connection,
      solConfig.BOT_WALLET,
      {}
    );
  } catch (error: any) {
    console.log(error.message);
  }
  let program: any;
  try {
    let idlFile: any = solConfig.idl;
    program = new anchor.Program(idlFile, solConfig.PROGRAM_ID, provider);
    console.log(program, "program");
  } catch (error: any) {
    console.log("in program", error.message);
  }
  const account = await program.accounts.PresaleInfo.fetch(presalePda);
  console.log(account, "accounts");
  return account ? account : null;
}
