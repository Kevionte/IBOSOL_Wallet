"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useWallet } from "../contexts/WalletContext";
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertCircle,
  Shield,
  Lock,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

// BIP39 (Vite friendly)
import { generateMnemonic, validateMnemonic } from "bip39";

interface CreateWalletModalProps {
  open: boolean;
  onClose: () => void;
}

function normalizeMnemonic(input: string) {
  return input.trim().toLowerCase().replace(/\s+/g, " ");
}

function generateSecureRecoveryPhrase(words: 12 | 24 = 12) {
  // bip39 expects entropy strength in bits
  const strength = words === 24 ? 256 : 128;
  return generateMnemonic(strength);
}

export function CreateWalletModal({ open, onClose }: CreateWalletModalProps) {
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [recoveryPhrase, setRecoveryPhrase] = useState("");
  const [confirmedPhrase, setConfirmedPhrase] = useState("");
  const [showPhrase, setShowPhrase] = useState(false);
  const [copied, setCopied] = useState(false);

  const { createWallet } = useWallet();

  const validatePassword = (pw: string) => {
    const errors: string[] = [];

    if (pw.length < 12) errors.push("At least 12 characters");
    if (!/[A-Z]/.test(pw)) errors.push("One uppercase letter");
    if (!/[a-z]/.test(pw)) errors.push("One lowercase letter");
    if (!/[0-9]/.test(pw)) errors.push("One number");
    if (!/[^A-Za-z0-9]/.test(pw)) errors.push("One special character");

    return errors;
  };

  const generateRecoveryPhrase = () => {
    const phrase = generateSecureRecoveryPhrase(12);
    setRecoveryPhrase(phrase);
  };

  const handleCreatePassword = () => {
    const errors = validatePassword(password);

    if (errors.length > 0) {
      toast.error(`Password requirements: ${errors.join(", ")}`);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const weakPasswords = ["password", "12345678", "qwerty123", "admin123"];
    if (weakPasswords.some((w) => password.toLowerCase().includes(w))) {
      toast.error("Password is too common. Please choose a stronger password.");
      return;
    }

    generateRecoveryPhrase();
    setStep(2);
  };

  const handleCopyPhrase = async () => {
    if (!showPhrase) {
      toast.error("Please reveal the recovery phrase first");
      return;
    }

    try {
      await navigator.clipboard.writeText(recoveryPhrase);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Recovery phrase copied to clipboard");
    } catch {
      toast.error("Clipboard copy failed. Please copy manually.");
    }
  };

  const handleConfirmPhrase = () => {
    const normalizedInput = normalizeMnemonic(confirmedPhrase);
    const normalizedPhrase = normalizeMnemonic(recoveryPhrase);

    const inputWords = normalizedInput.split(" ").filter(Boolean);
    const originalWords = normalizedPhrase.split(" ").filter(Boolean);

    if (inputWords.length !== 12) {
      toast.error(
        `Please enter exactly 12 words. You entered ${inputWords.length} words.`
      );
      return;
    }

    // bip39 validation (no wordlist param)
    if (!validateMnemonic(normalizedInput)) {
      toast.error("Recovery phrase is invalid. Check spelling and order.");
      return;
    }

    if (inputWords.join(" ") !== originalWords.join(" ")) {
      const mismatches: number[] = [];
      for (let i = 0; i < 12; i++) {
        if (inputWords[i] !== originalWords[i]) mismatches.push(i + 1);
      }
      toast.error(
        mismatches.length
          ? `Word(s) ${mismatches.join(", ")} do not match. Please check your phrase.`
          : "Recovery phrase does not match."
      );
      return;
    }

    createWallet(password, normalizedPhrase, "Account 1");
    toast.success("Wallet created successfully!");
    handleClose();
  };

  const resetForm = () => {
    setStep(1);
    setPassword("");
    setConfirmPassword("");
    setRecoveryPhrase("");
    setConfirmedPhrase("");
    setShowPhrase(false);
    setCopied(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="size-5 text-indigo-600" />
            Create New Wallet
          </DialogTitle>
          <DialogDescription>
            Create a secure wallet for your IBOSOL network assets
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="size-4" />
                Create Strong Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter strong password (min. 12 characters)"
                className="pr-10"
              />
              <p className="text-xs text-gray-500">
                Must include: 12+ chars, uppercase, lowercase, number, special char
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                <ShieldCheck className="size-4" />
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
              />
            </div>

            <Button
              onClick={handleCreatePassword}
              className="w-full flex items-center justify-center gap-2"
            >
              <Zap className="size-4" />
              Generate Wallet
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="size-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertCircle className="size-5 text-yellow-600" />
                </div>
                <div className="text-sm text-yellow-800">
                  <p className="font-bold text-yellow-900">Critical Security Step</p>
                  <p className="mt-1">
                    This 12-word recovery phrase is the ONLY way to restore your wallet. Store it securely offline.
                  </p>
                  <div className="mt-2 p-3 bg-yellow-100 rounded-lg">
                    <p className="text-xs font-semibold text-yellow-800">
                      ⚠️ DO NOT share this phrase with anyone
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Shield className="size-4" />
                  Recovery Phrase
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPhrase(!showPhrase)}
                  className="h-8 px-2"
                >
                  {showPhrase ? (
                    <>
                      <EyeOff className="size-4 mr-1" />
                      Hide
                    </>
                  ) : (
                    <>
                      <Eye className="size-4 mr-1" />
                      Show
                    </>
                  )}
                </Button>
              </div>

              <div
                className={`bg-gray-50 rounded-lg p-4 min-h-[120px] ${
                  !showPhrase ? "blur-sm select-none" : ""
                }`}
              >
                <div className="grid grid-cols-3 gap-3">
                  {recoveryPhrase.split(" ").map((word, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-white rounded px-3 py-2 border"
                    >
                      <span className="text-xs text-gray-400">{index + 1}.</span>
                      <span className="text-sm">{word}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleCopyPhrase}
                className="w-full"
                disabled={!showPhrase}
              >
                {copied ? (
                  <>
                    <Check className="size-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="size-4 mr-2" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
            </div>

            <Button
              onClick={() => setStep(3)}
              className="w-full flex items-center justify-center gap-2  from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              <Check className="size-4" />
              I've Saved My Recovery Phrase Securely
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <div className="size-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ShieldCheck className="size-5 text-blue-600" />
                </div>
                <div className="text-sm text-blue-800">
                  <p className="font-bold text-blue-900">Verify Recovery Phrase</p>
                  <p className="mt-1">
                    Enter your 12-word recovery phrase exactly as shown to confirm you've saved it correctly.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="confirmPhrase" className="flex items-center gap-2">
                <Lock className="size-4" />
                Confirm Recovery Phrase
              </Label>

              <textarea
                id="confirmPhrase"
                value={confirmedPhrase}
                onChange={(e) => setConfirmedPhrase(e.target.value)}
                placeholder="Enter all 12 words in order, separated by spaces"
                className="w-full min-h-[140px] px-3 py-2 border rounded-lg resize-none font-mono text-sm"
                spellCheck={false}
                autoCapitalize="none"
                autoCorrect="off"
              />

              <div className="flex justify-between text-xs text-gray-500">
                <span>Tip: Words must match exactly in order</span>
                <span>
                  {confirmedPhrase.trim()
                    ? confirmedPhrase.trim().split(/\s+/).filter(Boolean).length
                    : 0}
                  /12 words
                </span>
              </div>

              {confirmedPhrase.trim() && (
                <div className="pt-2">
                  <div className="text-xs font-medium text-gray-700 mb-1">
                    Word Validation:
                  </div>
                  <div className="grid grid-cols-6 gap-1">
                    {Array.from({ length: 12 }).map((_, index) => {
                      const inputWords = normalizeMnemonic(confirmedPhrase).split(" ");
                      const originalWords = normalizeMnemonic(recoveryPhrase).split(" ");
                      const isFilled = index < inputWords.length;
                      const isValid =
                        isFilled && inputWords[index] === originalWords[index];

                      return (
                        <div
                          key={index}
                          className={`h-2 rounded-full ${
                            !isFilled
                              ? "bg-gray-200"
                              : isValid
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                ← Back
              </Button>
              <Button
                onClick={handleConfirmPhrase}
                className="flex-1 flex items-center justify-center gap-2 from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Shield className="size-4" />
                Create Secure Wallet
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
