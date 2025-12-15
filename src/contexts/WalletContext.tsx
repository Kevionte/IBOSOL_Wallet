"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import CryptoJS from "crypto-js";
import { toast } from "sonner";

import {
  Wallet as EthersWallet,
  JsonRpcProvider,
  isAddress,
  parseUnits as ethersParseUnits,
  formatUnits,
} from "ethers";

import { secp256k1 } from "@noble/curves/secp256k1.js";
import { keccak_256 } from "@noble/hashes/sha3.js";
import { pbkdf2 } from "@noble/hashes/pbkdf2.js";
import { sha512 } from "@noble/hashes/sha2.js";
import { HDKey } from "@scure/bip32";

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  logo?: string;
}

export interface Network {
  chainId: number;
  rpcUrl: string;
  name: string;
  symbol: string;
  decimals: number;
  explorerUrl: string;
  isCustom?: boolean;
}

export interface Account {
  id: string;
  name: string;
  address: string;
  encryptedKey: string;
  type: "phrase" | "privateKey";
}

interface WalletContextType {
  isLocked: boolean;
  hasWallet: boolean;
  address: string | null;
  balance: string;
  transactions: any[];
  tokens: Token[];
  currentNetwork: Network;
  networks: Network[];
  accounts: Account[];
  currentAccount: Account | null;

  createWallet: (password: string, recoveryPhrase: string, accountName?: string) => void;
  importWallet: (password: string, recoveryPhrase: string) => void;
  importWithPrivateKey: (password: string, privateKey: string) => void;

  importAccount: (password: string, recoveryPhrase: string, accountName: string) => Account;
  importAccountWithKey: (password: string, privateKey: string, accountName: string) => Account;

  switchAccount: (accountId: string) => void;
  unlockWallet: (password: string) => boolean;
  lockWallet: () => void;

  sendTransaction: (to: string, amount: string) => Promise<string>;
  refreshBalance: () => Promise<void>;
  refreshTransactions: () => Promise<void>;

  addToken: (token: Omit<Token, "balance">) => Token[];
  removeToken: (address: string) => Token[];

  switchNetwork: (chainId: number) => void;
  addNetwork: (network: Network) => Network;
  removeNetwork: (chainId: number) => Network[];

  exportPrivateKey: (password: string) => string | null;

  deleteWallet: () => void;
  renameAccount: (accountId: string, newName: string) => Account[];
  removeAccount: (accountId: string) => Account[];
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const IBOSOL_MAINNET: Network = {
  chainId: 990715,
  rpcUrl: "https://testnet-rpc1.ibosol.network",
  name: "IBOSOL Testnet",
  symbol: "IBO",
  decimals: 18,
  explorerUrl: "https://testnet-explorer.ibosol.network",
};

const DEFAULT_NETWORKS: Network[] = [IBOSOL_MAINNET];

/* -------------------------- low level helpers -------------------------- */

function strip0x(hex: string) {
  return hex.startsWith("0x") ? hex.slice(2) : hex;
}

function isHex(s: string) {
  return /^[0-9a-fA-F]+$/.test(s);
}

function isValidHexAddress(addr: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(addr.trim());
}

function normalizeMnemonic(input: string) {
  return input.trim().toLowerCase().replace(/\s+/g, " ");
}

function hexToBytes(hex: string) {
  const h = strip0x(hex);
  if (!h || h.length % 2 !== 0 || !isHex(h)) throw new Error("Invalid hex");
  const out = new Uint8Array(h.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(h.slice(i * 2, i * 2 + 2), 16);
  return out;
}

function bytesToHex(bytes: Uint8Array) {
  let s = "0x";
  for (const b of bytes) s += b.toString(16).padStart(2, "0");
  return s;
}

function keccak256(data: Uint8Array) {
  return keccak_256(data);
}

/* address from private key */
function addressFromPrivateKey(privateKey32: Uint8Array): string {
  if (privateKey32.length !== 32) throw new Error("Invalid private key length");

  const pub = secp256k1.getPublicKey(privateKey32, false); // uncompressed 65 bytes
  if (!(pub instanceof Uint8Array)) throw new Error("Unexpected public key format");
  if (pub.length !== 65) throw new Error(`Invalid public key length: ${pub.length}, expected 65`);

  const pubNoPrefix = pub.slice(1); // 64 bytes
  const hash = keccak256(pubNoPrefix);
  const addr = hash.slice(-20);
  return bytesToHex(addr).toLowerCase();
}

/* derive private key from phrase using ethers.js (MetaMask compatible) */
function privateKeyFromPhraseEthers(phrase: string): Uint8Array {
  const normalized = normalizeMnemonic(phrase);

  try {
    const wallet = EthersWallet.fromPhrase(normalized);
    const privateKeyHex = strip0x(wallet.privateKey);
    return hexToBytes(privateKeyHex);
  } catch {
    // fallback: derive seed without wordlist validation, then BIP44 path
    const seed = pbkdf2(
      sha512,
      new TextEncoder().encode(normalized),
      new TextEncoder().encode("mnemonic"),
      { c: 2048, dkLen: 64 }
    );

    const hdkey = HDKey.fromMasterSeed(seed);
    const child = hdkey.derive("m/44'/60'/0'/0/0");
    if (!child.privateKey) throw new Error("Failed to derive private key from seed phrase");
    return child.privateKey;
  }
}

/* rpc */
async function rpcCall(rpcUrl: string, method: string, params: any[]) {
  const res = await fetch(rpcUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method, params }),
  });
  const json = await res.json();
  if (json?.error) throw new Error(json.error.message || "RPC error");
  return json.result;
}

/* decrypt secret (phrase or private key) */
function decryptAccountSecret(account: Account, password: string) {
  const decrypted = CryptoJS.AES.decrypt(account.encryptedKey, password).toString(CryptoJS.enc.Utf8);
  if (!decrypted) throw new Error("Incorrect password");
  return decrypted;
}

/* ---------------------------------------------------------------------- */

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isLocked, setIsLocked] = useState(true);
  const [hasWallet, setHasWallet] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState("0.000000");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [currentNetwork, setCurrentNetwork] = useState<Network>(IBOSOL_MAINNET);
  const [networks, setNetworks] = useState<Network[]>(DEFAULT_NETWORKS);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);

  // keep password only while unlocked (memory only)
  const [masterPassword, setMasterPassword] = useState<string>("");

  useEffect(() => {
    const savedAccounts = localStorage.getItem("accounts");
    const savedNetworks = localStorage.getItem("customNetworks");
    const savedTokens = localStorage.getItem("customTokens");
    const savedNetworkId = localStorage.getItem("selectedNetwork");
    const savedAccountId = localStorage.getItem("currentAccountId");

    if (savedAccounts) {
      try {
        const parsedAccounts = JSON.parse(savedAccounts) as Account[];
        setAccounts(parsedAccounts);
        setHasWallet(parsedAccounts.length > 0);
      } catch {
        console.error("Failed to load accounts");
      }
    }

    let allNetworks = DEFAULT_NETWORKS;
    if (savedNetworks) {
      try {
        const customNetworks = JSON.parse(savedNetworks) as Network[];
        allNetworks = [...DEFAULT_NETWORKS, ...customNetworks];
      } catch {
        console.error("Failed to load custom networks");
      }
    }
    setNetworks(allNetworks);

    if (savedTokens) {
      try {
        setTokens(JSON.parse(savedTokens));
      } catch {
        console.error("Failed to load custom tokens");
      }
    }

    if (savedNetworkId) {
      const n = allNetworks.find((x) => x.chainId === parseInt(savedNetworkId, 10));
      if (n) setCurrentNetwork(n);
    }

    if (savedAccountId && savedAccounts) {
      try {
        const parsedAccounts = JSON.parse(savedAccounts) as Account[];
        const acc = parsedAccounts.find((a) => a.id === savedAccountId) || null;
        if (acc) {
          setCurrentAccount(acc);
          setAddress(acc.address);
        }
      } catch {
        console.error("Failed to load current account");
      }
    }
  }, []);

  useEffect(() => {
    if (!isLocked && address) {
      refreshBalance();
      refreshTransactions();
      const interval = setInterval(() => {
        refreshBalance();
        refreshTransactions();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isLocked, address, currentNetwork]);

  const createWallet = (password: string, recoveryPhrase: string, accountName: string = "Account 1") => {
    const phrase = normalizeMnemonic(recoveryPhrase);
    const wc = phrase.split(" ").filter(Boolean).length;
    if (wc !== 12 && wc !== 24) throw new Error("Recovery phrase must be 12 or 24 words");

    const pk = privateKeyFromPhraseEthers(phrase);
    const addr = addressFromPrivateKey(pk);

    const encrypted = CryptoJS.AES.encrypt(phrase, password).toString();

    const newAccount: Account = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
      name: accountName,
      address: addr,
      encryptedKey: encrypted,
      type: "phrase",
    };

    const newAccounts = [newAccount];
    setAccounts(newAccounts);
    setCurrentAccount(newAccount);
    setAddress(addr);
    setHasWallet(true);
    setIsLocked(false);
    setMasterPassword(password);

    localStorage.setItem("accounts", JSON.stringify(newAccounts));
    localStorage.setItem("currentAccountId", newAccount.id);

    setTimeout(() => {
      refreshBalance();
      refreshTransactions();
    }, 100);
  };

  const importWallet = (password: string, recoveryPhrase: string) => {
    createWallet(password, recoveryPhrase, "Account 1");
  };

  const importWithPrivateKey = (password: string, privateKey: string) => {
    const clean = strip0x(privateKey.trim());
    if (clean.length !== 64 || !isHex(clean)) throw new Error("Invalid private key format");

    const pk = hexToBytes(clean);
    const addr = addressFromPrivateKey(pk);

    const encrypted = CryptoJS.AES.encrypt("0x" + clean, password).toString();

    const newAccount: Account = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
      name: "Account 1",
      address: addr,
      encryptedKey: encrypted,
      type: "privateKey",
    };

    const newAccounts = [newAccount];
    setAccounts(newAccounts);
    setCurrentAccount(newAccount);
    setAddress(addr);
    setHasWallet(true);
    setIsLocked(false);
    setMasterPassword(password);

    localStorage.setItem("accounts", JSON.stringify(newAccounts));
    localStorage.setItem("currentAccountId", newAccount.id);

    setTimeout(() => {
      refreshBalance();
      refreshTransactions();
    }, 100);
  };

  const importAccount = (password: string, recoveryPhrase: string, accountName: string) => {
    if (password !== masterPassword) throw new Error("Incorrect password");

    const phrase = normalizeMnemonic(recoveryPhrase);
    const wc = phrase.split(" ").filter(Boolean).length;
    if (wc !== 12 && wc !== 24) throw new Error("Recovery phrase must be 12 or 24 words");

    const pk = privateKeyFromPhraseEthers(phrase);
    const addr = addressFromPrivateKey(pk);

    if (accounts.some((acc) => acc.address.toLowerCase() === addr.toLowerCase())) {
      throw new Error("Account already exists");
    }

    const encrypted = CryptoJS.AES.encrypt(phrase, password).toString();

    const newAccount: Account = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
      name: accountName || `Account ${accounts.length + 1}`,
      address: addr,
      encryptedKey: encrypted,
      type: "phrase",
    };

    const updated = [...accounts, newAccount];
    setAccounts(updated);
    localStorage.setItem("accounts", JSON.stringify(updated));

    return newAccount;
  };

  const importAccountWithKey = (password: string, privateKey: string, accountName: string) => {
    if (password !== masterPassword) throw new Error("Incorrect password");

    const clean = strip0x(privateKey.trim());
    if (clean.length !== 64 || !isHex(clean)) throw new Error("Invalid private key format");

    const pk = hexToBytes(clean);
    const addr = addressFromPrivateKey(pk);

    if (accounts.some((acc) => acc.address.toLowerCase() === addr.toLowerCase())) {
      throw new Error("Account already exists");
    }

    const encrypted = CryptoJS.AES.encrypt("0x" + clean, password).toString();

    const newAccount: Account = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
      name: accountName || `Account ${accounts.length + 1}`,
      address: addr,
      encryptedKey: encrypted,
      type: "privateKey",
    };

    const updated = [...accounts, newAccount];
    setAccounts(updated);
    localStorage.setItem("accounts", JSON.stringify(updated));

    return newAccount;
  };

  const switchAccount = (accountId: string) => {
    const acc = accounts.find((a) => a.id === accountId);
    if (!acc) return;

    setCurrentAccount(acc);
    setAddress(acc.address);
    setBalance("0.000000");
    setTransactions([]);
    localStorage.setItem("currentAccountId", accountId);

    Promise.resolve().then(() => {
      refreshBalance();
      refreshTransactions();
    });
  };

  const unlockWallet = (password: string): boolean => {
    if (accounts.length === 0) return false;

    try {
      decryptAccountSecret(accounts[0], password);

      setMasterPassword(password);

      const savedAccountId = localStorage.getItem("currentAccountId");
      const acc = savedAccountId ? accounts.find((a) => a.id === savedAccountId) || accounts[0] : accounts[0];

      setCurrentAccount(acc);
      setAddress(acc.address);
      setIsLocked(false);

      setTimeout(() => {
        refreshBalance();
        refreshTransactions();
      }, 100);

      return true;
    } catch {
      return false;
    }
  };

  const lockWallet = () => {
    setIsLocked(true);
    setMasterPassword("");
    setAddress(null);
    setBalance("0.000000");
    setTransactions([]);
  };

  const refreshBalance = async () => {
    if (!address) return;

    try {
      const result = await rpcCall(currentNetwork.rpcUrl, "eth_getBalance", [address, "latest"]);
      const balanceWei = BigInt(result);
      const bal = Number(balanceWei) / Math.pow(10, currentNetwork.decimals);
      setBalance(Number.isFinite(bal) ? bal.toFixed(6) : "0.000000");
    } catch (error) {
      console.error("Failed to fetch balance:", error);
      setBalance("0.000000");
    }
  };

  const refreshTransactions = async () => {
    if (!address) return;

    try {
      const response = await fetch(`${currentNetwork.explorerUrl}/backend/api/v2/addresses/${address}/transactions`, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (data?.items) {
        const sorted = data.items.sort(
          (a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setTransactions(sorted.slice(0, 15));
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      setTransactions([]);
    }
  };

  // ✅ UPDATED: uses ethers to sign (fixes noble "recovered" + recoverPublicKey issues)
  const sendTransaction = async (to: string, amount: string): Promise<string> => {
    if (!currentAccount) throw new Error("No wallet connected");
    if (isLocked || !masterPassword) throw new Error("Wallet is locked");

    const rpcUrl = currentNetwork.rpcUrl;
    const from = currentAccount.address;
    const toTrim = to.trim();

    if (!isAddress(toTrim) && !isValidHexAddress(toTrim)) {
      throw new Error("Invalid recipient address");
    }

    const valueWei = ethersParseUnits(amount.trim(), currentNetwork.decimals);
    if (valueWei <= 0n) throw new Error("Invalid amount");

    // decrypt phrase or private key -> get private key hex
    const secret = decryptAccountSecret(currentAccount, masterPassword);

    let privateKeyHex: string;
    if (currentAccount.type === "privateKey") {
      const clean = strip0x(secret.trim());
      if (clean.length !== 64 || !isHex(clean)) throw new Error("Invalid stored private key");
      privateKeyHex = "0x" + clean;
    } else {
      const pkBytes = privateKeyFromPhraseEthers(secret);
      privateKeyHex = bytesToHex(pkBytes);
    }

    // sanity: ensure derived address matches selected account
    const derivedAddr = addressFromPrivateKey(hexToBytes(strip0x(privateKeyHex)));
    if (derivedAddr.toLowerCase() !== currentAccount.address.toLowerCase()) {
      throw new Error("Key does not match selected account");
    }

    const provider = new JsonRpcProvider(rpcUrl, {
      chainId: currentNetwork.chainId,
      name: currentNetwork.name,
    });

    const wallet = new EthersWallet(privateKeyHex, provider);

    // on chain balance + nonce
    const onchainBal = await provider.getBalance(from);
    const nonce = await provider.getTransactionCount(from, "pending");

    // fee estimation (supports both legacy + EIP1559)
    const feeData = await provider.getFeeData();

    const baseTx: any = {
      chainId: currentNetwork.chainId,
      from,
      to: toTrim,
      value: valueWei,
      nonce,
    };

    const gasLimit = await provider.estimateGas(baseTx);
    baseTx.gasLimit = gasLimit;

    if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
      baseTx.maxFeePerGas = feeData.maxFeePerGas;
      baseTx.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;

      const totalCost = valueWei + gasLimit * feeData.maxFeePerGas;
      if (onchainBal < totalCost) {
        const need = formatUnits(totalCost, currentNetwork.decimals);
        const have = formatUnits(onchainBal, currentNetwork.decimals);
        throw new Error(
          `Insufficient funds (amount + gas).\nNeed ~${need} ${currentNetwork.symbol}, have ${have} ${currentNetwork.symbol}`
        );
      }
    } else if (feeData.gasPrice) {
      baseTx.gasPrice = feeData.gasPrice;

      const totalCost = valueWei + gasLimit * feeData.gasPrice;
      if (onchainBal < totalCost) {
        const need = formatUnits(totalCost, currentNetwork.decimals);
        const have = formatUnits(onchainBal, currentNetwork.decimals);
        throw new Error(
          `Insufficient funds (amount + gas).\nNeed ~${need} ${currentNetwork.symbol}, have ${have} ${currentNetwork.symbol}`
        );
      }
    } else {
      throw new Error("Could not determine gas fees from RPC (feeData empty).");
    }

    // sign + broadcast
    const rawTx = await wallet.signTransaction(baseTx);
    const sent = await provider.broadcastTransaction(rawTx);

    setTimeout(() => {
      refreshBalance();
      refreshTransactions();
    }, 1500);

    return sent.hash;
  };

  const addToken = (token: Omit<Token, "balance">) => {
    const newToken: Token = { ...token, balance: "0" };
    const updated = [...tokens, newToken];
    setTokens(updated);
    localStorage.setItem("customTokens", JSON.stringify(updated));
    return updated;
  };

  const removeToken = (tokenAddress: string) => {
    const updated = tokens.filter((t) => t.address !== tokenAddress);
    setTokens(updated);
    localStorage.setItem("customTokens", JSON.stringify(updated));
    return updated;
  };

  const switchNetwork = (chainId: number) => {
    const n = networks.find((x) => x.chainId === chainId);
    if (!n) return;

    setCurrentNetwork(n);
    localStorage.setItem("selectedNetwork", chainId.toString());
    setBalance("0.000000");
    setTransactions([]);

    setTimeout(() => {
      refreshBalance();
      refreshTransactions();
    }, 100);
  };

  const addNetwork = (network: Network) => {
    if (!network.chainId || !network.rpcUrl || !network.name || !network.symbol) {
      throw new Error("Invalid network parameters");
    }
    if (networks.some((n) => n.chainId === network.chainId)) {
      throw new Error("Network with this Chain ID already exists");
    }

    const customNetworks = networks.filter((n) => n.isCustom);
    const newNetwork = { ...network, isCustom: true };
    const updatedNetworks = [...DEFAULT_NETWORKS, ...customNetworks, newNetwork];

    setNetworks(updatedNetworks);
    localStorage.setItem("customNetworks", JSON.stringify([...customNetworks, newNetwork]));
    return newNetwork;
  };

  const removeNetwork = (chainId: number) => {
    const n = networks.find((x) => x.chainId === chainId);
    if (n && !n.isCustom) throw new Error("Cannot remove default network");

    const updated = networks.filter((x) => x.chainId !== chainId);
    setNetworks(updated);

    const customNetworks = updated.filter((x) => x.isCustom);
    localStorage.setItem("customNetworks", JSON.stringify(customNetworks));

    if (currentNetwork.chainId === chainId) {
      switchNetwork(DEFAULT_NETWORKS[0].chainId);
    }

    return updated;
  };

  const exportPrivateKey = (password: string): string | null => {
    if (!currentAccount) return null;

    try {
      const secret = decryptAccountSecret(currentAccount, password);

      if (currentAccount.type === "privateKey") {
        const clean = strip0x(secret.trim());
        if (clean.length !== 64 || !isHex(clean)) return null;
        return "0x" + clean;
      }

      const pk = privateKeyFromPhraseEthers(secret);
      return bytesToHex(pk);
    } catch {
      return null;
    }
  };

  const renameAccount = (accountId: string, newName: string) => {
    const updated = accounts.map((acc) => (acc.id === accountId ? { ...acc, name: newName } : acc));
    setAccounts(updated);
    localStorage.setItem("accounts", JSON.stringify(updated));

    if (currentAccount?.id === accountId) {
      setCurrentAccount({ ...currentAccount, name: newName });
    }
    return updated;
  };

  const removeAccount = (accountId: string) => {
    if (accounts.length === 1) throw new Error("Cannot remove the last account");

    const updated = accounts.filter((acc) => acc.id !== accountId);
    setAccounts(updated);
    localStorage.setItem("accounts", JSON.stringify(updated));

    if (currentAccount?.id === accountId) {
      switchAccount(updated[0].id);
    }
    return updated;
  };

  const deleteWallet = () => {
    localStorage.removeItem("accounts");
    localStorage.removeItem("currentAccountId");
    localStorage.removeItem("customNetworks");
    localStorage.removeItem("selectedNetwork");
    localStorage.removeItem("customTokens");

    setAccounts([]);
    setCurrentAccount(null);
    setHasWallet(false);
    setIsLocked(true);
    setAddress(null);
    setBalance("0.000000");
    setTransactions([]);
    setMasterPassword("");
    setNetworks(DEFAULT_NETWORKS);
    setTokens([]);
    setCurrentNetwork(DEFAULT_NETWORKS[0]);
  };

  return (
    <WalletContext.Provider
      value={{
        isLocked,
        hasWallet,
        address,
        balance,
        transactions,
        tokens,
        currentNetwork,
        networks,
        accounts,
        currentAccount,

        createWallet,
        importWallet,
        importWithPrivateKey,
        importAccount,
        importAccountWithKey,

        switchAccount,
        unlockWallet,
        lockWallet,

        sendTransaction,
        refreshBalance,
        refreshTransactions,

        addToken,
        removeToken,

        switchNetwork,
        addNetwork,
        removeNetwork,

        exportPrivateKey,
        deleteWallet,
        renameAccount,
        removeAccount,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
};
