"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useWallet } from "../contexts/WalletContext";
import { toast } from "sonner";
import { Loader2, ArrowUpCircle, ArrowDownCircle, Wallet } from "lucide-react";

interface SendModalProps {
  open: boolean;
  onClose: () => void;
  token?: {
    symbol: string;
    name: string;
    balance: string;
    decimals: number;
    address?: string;
    isNative?: boolean;
  };
}

const FALLBACK_FEE = 0.0001;

function normalizeNumberString(s: string) {
  return s.replace(/,/g, "").trim();
}

function countDecimals(value: string) {
  const parts = value.split(".");
  return parts[1]?.length ?? 0;
}

function isValidHexAddress(addr: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(addr.trim());
}

function clampToDecimals(value: number, decimals: number) {
  const factor = Math.pow(10, decimals);
  return Math.floor(value * factor) / factor;
}

export function SendModal({ open, onClose, token }: SendModalProps) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"send" | "receive">("send");

  // fee state
  const [feeEstimate, setFeeEstimate] = useState<number>(FALLBACK_FEE);
  const [feeLoading, setFeeLoading] = useState(false);

  const { sendTransaction, balance, currentNetwork, currentAccount, address } =
    useWallet();

  // Use token props if provided, otherwise fall back to native token
  const symbol = token?.symbol || currentNetwork?.symbol || "";
  const tokenName = token?.name || currentNetwork?.name || "";
  const tokenBalance = token?.balance || balance || "0";
  const decimals = token?.decimals || currentNetwork?.decimals || 18;
  const isNativeToken = token?.isNative !== undefined ? token.isNative : true;

  const balanceNum = useMemo(() => {
    const n = parseFloat(normalizeNumberString(tokenBalance || "0"));
    return Number.isFinite(n) ? n : 0;
  }, [tokenBalance]);

  const totalNum = useMemo(() => {
    const a = parseFloat(normalizeNumberString(amount || "0"));
    if (!Number.isFinite(a) || a <= 0) return feeEstimate;
    return a + feeEstimate;
  }, [amount, feeEstimate]);

  const reset = () => {
    setRecipient("");
    setAmount("");
    setActiveTab("send");
  };

  const handleClose = () => {
    if (loading) return;
    reset();
    onClose();
  };

  // Simplified fee estimation since we don't have actual RPC methods
  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!open) return;

      const to = recipient.trim();
      const amt = normalizeNumberString(amount);

      // only estimate when inputs are valid enough
      if (!isValidHexAddress(to)) {
        setFeeEstimate(FALLBACK_FEE);
        return;
      }

      if (!amt || !/^\d+(\.\d+)?$/.test(amt)) {
        setFeeEstimate(FALLBACK_FEE);
        return;
      }

      const decCount = countDecimals(amt);
      if (decCount > decimals) {
        setFeeEstimate(FALLBACK_FEE);
        return;
      }

      const amtNum = parseFloat(amt);
      if (!Number.isFinite(amtNum) || amtNum <= 0) {
        setFeeEstimate(FALLBACK_FEE);
        return;
      }

      setFeeLoading(true);

      try {
        // Simulate fee estimation with a small delay
        await new Promise(resolve => setTimeout(resolve, 300));
        if (!cancelled) {
          // For native tokens, we use a fixed fee
          // For custom tokens, we might need to adjust this
          setFeeEstimate(isNativeToken ? FALLBACK_FEE : FALLBACK_FEE * 1.5);
        }
      } catch {
        if (!cancelled) setFeeEstimate(FALLBACK_FEE);
      } finally {
        if (!cancelled) setFeeLoading(false);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, recipient, amount, decimals, isNativeToken]);

  const handleSend = async () => {
    const to = recipient.trim();
    const amtRaw = normalizeNumberString(amount);

    if (!to || !amtRaw) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!isValidHexAddress(to)) {
      toast.error("Invalid recipient address. Use a valid 0x address.");
      return;
    }

    if (currentAccount?.address && to.toLowerCase() === currentAccount.address.toLowerCase()) {
      toast.error("You can't send to the same address.");
      return;
    }

    if (!/^\d+(\.\d+)?$/.test(amtRaw)) {
      toast.error("Invalid amount format.");
      return;
    }

    if (countDecimals(amtRaw) > decimals) {
      toast.error(`Too many decimals. Max ${decimals} decimal places.`);
      return;
    }

    const amtNum = parseFloat(amtRaw);
    if (!Number.isFinite(amtNum) || amtNum <= 0) {
      toast.error("Invalid amount. Enter a positive number.");
      return;
    }

    if (amtNum + feeEstimate > balanceNum + 1e-12) {
      toast.error("Insufficient balance (including network fee).");
      return;
    }

    setLoading(true);
    try {
      await sendTransaction(to, amtRaw);
      toast.success("Transaction sent successfully!");
      handleClose();
    } catch (error: any) {
      console.error("Send transaction error:", error);
      toast.error(error?.message || "Transaction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMax = () => {
    if (loading) return;

    const max = Math.max(0, balanceNum - feeEstimate);
    const clamped = clampToDecimals(max, decimals);

    const displayDecimals = Math.min(decimals, 6);
    setAmount(clamped.toFixed(displayDecimals));
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border-0 bg-gradient-to-b from-white to-gray-50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {token ? (
              <>
                <div className="size-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">{symbol.charAt(0)}</span>
                </div>
                {tokenName}
              </>
            ) : (
              <>Send {symbol}</>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex border-2 rounded-xl mb-6 bg-gradient-to-r from-gray-50 to-gray-100 p-1.5 shadow-inner">
          <button
            className={`flex-1 py-3 px-4 text-center rounded-lg transition-all duration-200 ${
              activeTab === "send"
                ? "bg-white text-indigo-600 shadow-md font-semibold"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
            }`}
            onClick={() => setActiveTab("send")}
          >
            <div className="flex items-center justify-center gap-2">
              <ArrowUpCircle className="size-5" />
              Send
            </div>
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center rounded-lg transition-all duration-200 ${
              activeTab === "receive"
                ? "bg-white text-indigo-600 shadow-md font-semibold"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
            }`}
            onClick={() => setActiveTab("receive")}
          >
            <div className="flex items-center justify-center gap-2">
              <ArrowDownCircle className="size-5" />
              Receive
            </div>
          </button>
        </div>

        {activeTab === "send" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Address</Label>
              <Input
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                disabled={loading}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className="rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 py-3 transition-colors duration-200 shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="amount">Amount</Label>
                <span className="text-sm text-gray-500">
                  Balance: {tokenBalance} {symbol}
                </span>
              </div>

              <div className="relative">
                <Input
                  id="amount"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  disabled={loading}
                  className="rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 py-3 transition-colors duration-200 shadow-sm pr-12"
                />
                <button
                  type="button"
                  onClick={handleMax}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-50 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-lg transition-colors duration-200"
                  disabled={loading}
                >
                  Max
                </button>
              </div>

              <p className="text-xs text-gray-500">
                Max decimals: {decimals}. Fee updates when address and amount look valid.
              </p>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4 space-y-2 text-sm shadow-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Network Fee</span>
                <span className="flex items-center gap-2">
                  {feeLoading ? (
                    <>
                      <Loader2 className="size-3 animate-spin" />
                      Estimating…
                    </>
                  ) : (
                    <>~{feeEstimate.toFixed(6)} {currentNetwork?.symbol || "ETH"}</>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total</span>
                <span>
                  {Number.isFinite(totalNum) ? totalNum.toFixed(6) : "0.000000"} {symbol}
                </span>
              </div>
            </div>

            <Button onClick={handleSend} className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send"
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <div className="mx-auto size-24 bg-indigo-100 rounded-full flex items-center justify-center">
              <Wallet className="size-12 text-indigo-600" />
            </div>
            
            <div>
              <h3 className="font-medium text-lg">Your Wallet Address</h3>
              <p className="text-sm text-gray-500 mt-1">
                Share this address to receive {symbol}
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-5 shadow-sm">
              <code className="text-sm break-all font-mono">
                {address || "0x0000000000000000000000000000000000000000"}
              </code>
            </div>
            
            <Button 
              onClick={() => {
                navigator.clipboard.writeText(address || "");
                toast.success("Address copied to clipboard");
              }}
              className="w-full"
            >
              Copy Address
            </Button>
            
            <div className="text-xs text-gray-500 mt-4">
              <p>Only send {symbol} ({tokenName}) to this address.</p>
              <p>Sending any other asset may result in permanent loss.</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}