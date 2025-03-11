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
exports.getVaultPDA = exports.getUserInfoPDA = exports.getPresalePDA = exports.getSuperPresalePDA = exports.USER_SEED = exports.PRESALE_VAULT = exports.PRESALE_SEED = void 0;
exports.getAdminAta = getAdminAta;
exports.getPresaleData = getPresaleData;
// import { adminKeyPair, connection, privateKey, programID } from "@/constants";
const spl_token_1 = require("@solana/spl-token");
// import { AnchorWallet } from "@solana/wallet-adapter-react";
const web3_js_1 = require("@solana/web3.js");
const solana_1 = require("../config/solana");
exports.PRESALE_SEED = "PRESALE_SEED";
exports.PRESALE_VAULT = "PRESALE_VAULT";
exports.USER_SEED = "USER_SEED";
const anchor = __importStar(require("@project-serum/anchor"));
// const progId = new PublicKey("6RdWeathhyGS625o2yAMabLEhyN3WasXfAbR3Hw7CnS9");
const getSuperPresalePDA = () => {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(exports.PRESALE_SEED)], solana_1.solConfig.PROGRAM_ID);
};
exports.getSuperPresalePDA = getSuperPresalePDA;
const getPresalePDA = (wallet) => {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(exports.PRESALE_SEED), wallet.toBuffer()], solana_1.solConfig.PROGRAM_ID
    // progId
    );
};
exports.getPresalePDA = getPresalePDA;
const getUserInfoPDA = (wallet, admin) => __awaiter(void 0, void 0, void 0, function* () {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(exports.USER_SEED), wallet.toBuffer(), admin.toBuffer()], solana_1.solConfig.PROGRAM_ID);
});
exports.getUserInfoPDA = getUserInfoPDA;
const getVaultPDA = (wallet) => __awaiter(void 0, void 0, void 0, function* () {
    return yield web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(exports.PRESALE_VAULT), wallet.toBuffer()], solana_1.solConfig.PROGRAM_ID);
});
exports.getVaultPDA = getVaultPDA;
function getAdminAta(tokenAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        const adminAta = (yield (0, spl_token_1.getOrCreateAssociatedTokenAccount)(solana_1.solConfig.connection, solana_1.solConfig.BOT_KEYPAIR, tokenAddress, solana_1.solConfig.BOT_KEYPAIR.publicKey)).address;
        console.log("adminAta: ", adminAta.toBase58());
        return adminAta;
    });
}
function getPresaleData(wallet) {
    return __awaiter(this, void 0, void 0, function* () {
        const [presalePda] = (0, exports.getPresalePDA)(wallet);
        let provider;
        // const anchorWallet = new anchor.a();
        try {
            provider = new anchor.AnchorProvider(solana_1.solConfig.connection, solana_1.solConfig.BOT_WALLET, {});
        }
        catch (error) {
            console.log(error.message);
        }
        let program;
        try {
            let idlFile = solana_1.solConfig.idl;
            program = new anchor.Program(idlFile, solana_1.solConfig.PROGRAM_ID, provider);
            console.log(program, "program");
        }
        catch (error) {
            console.log("in program", error.message);
        }
        const account = yield program.accounts.PresaleInfo.fetch(presalePda);
        console.log(account, "accounts");
        return account ? account : null;
    });
}
