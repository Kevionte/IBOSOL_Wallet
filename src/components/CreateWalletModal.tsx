"use client";

import React, { useMemo, useState } from "react";
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
  AlertTriangle,
  Shield,
  Lock,
  Zap,
  ShieldCheck,
  Key,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { generateMnemonic, validateMnemonic } from "bip39";

interface CreateWalletModalProps {
  open: boolean;
  onClose: () => void;
}

function normalizeMnemonic(input: string) {
  return input.trim().toLowerCase().replace(/\s+/g, " ");
}

function generateSecureRecoveryPhrase(words: 12 | 24 = 12) {
  const strength = words === 24 ? 256 : 128;
  return generateMnemonic(strength);
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function CreateWalletModal({ open, onClose }: CreateWalletModalProps) {
  const { createWallet } = useWallet();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [recoveryPhrase, setRecoveryPhrase] = useState("");
  const [confirmedPhrase, setConfirmedPhrase] = useState("");

  const [showPhrase, setShowPhrase] = useState(false);
  const [copied, setCopied] = useState(false);

  const pwErrors = useMemo(() => {
    const errors: string[] = [];
    const pw = password;

    if (pw.length < 12) errors.push("12+ chars");
    if (!/[A-Z]/.test(pw)) errors.push("uppercase");
    if (!/[a-z]/.test(pw)) errors.push("lowercase");
    if (!/[0-9]/.test(pw)) errors.push("number");
    if (!/[^A-Za-z0-9]/.test(pw)) errors.push("symbol");
    return errors;
  }, [password]);

  const pwIsValid = pwErrors.length === 0;
  const pwMatches = password.length > 0 && password === confirmPassword;

  const words = useMemo(() => {
    return recoveryPhrase ? recoveryPhrase.split(" ").filter(Boolean) : [];
  }, [recoveryPhrase]);

  const confirmedCount = useMemo(() => {
    const n = normalizeMnemonic(confirmedPhrase);
    return n ? n.split(" ").filter(Boolean).length : 0;
  }, [confirmedPhrase]);

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

  const generateRecoveryPhrase = () => {
    const phrase = generateSecureRecoveryPhrase(12);
    setRecoveryPhrase(phrase);
  };

  const handleCreatePassword = () => {
    if (!pwIsValid) {
      toast.error(`Password needs: ${pwErrors.join(", ")}`);
      return;
    }
    if (!pwMatches) {
      toast.error("Passwords do not match");
      return;
    }

    const weak = ["password", "12345678", "qwerty123", "admin123"];
    if (weak.some((w) => password.toLowerCase().includes(w))) {
      toast.error("Password is too common. Use a stronger one.");
      return;
    }

    generateRecoveryPhrase();
    setStep(2);
  };

  const handleCopyPhrase = async () => {
    if (!showPhrase) {
      toast.error("Reveal the recovery phrase first");
      return;
    }

    try {
      await navigator.clipboard.writeText(recoveryPhrase);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
      toast.success("Copied");
    } catch {
      toast.error("Copy failed. Please copy manually.");
    }
  };

  const handleConfirmPhrase = () => {
    const normalizedInput = normalizeMnemonic(confirmedPhrase);
    const normalizedPhrase = normalizeMnemonic(recoveryPhrase);

    const inputWords = normalizedInput.split(" ").filter(Boolean);
    const originalWords = normalizedPhrase.split(" ").filter(Boolean);

    if (inputWords.length !== 12) {
      toast.error(`Enter exactly 12 words (you have ${inputWords.length})`);
      return;
    }

    if (!validateMnemonic(normalizedInput)) {
      toast.error("Phrase looks invalid. Check spelling and order.");
      return;
    }

    if (inputWords.join(" ") !== originalWords.join(" ")) {
      const mismatches: number[] = [];
      for (let i = 0; i < 12; i++) {
        if (inputWords[i] !== originalWords[i]) mismatches.push(i + 1);
      }
      toast.error(
        mismatches.length
          ? `Word(s) ${mismatches.join(", ")} do not match`
          : "Phrase does not match"
      );
      return;
    }

    createWallet(password, normalizedPhrase, "Account 1");
    toast.success("Wallet created");
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-[560px] rounded-[28px] border border-white/10 bg-[#0B1020] p-0 text-white shadow-[0_24px_120px_rgba(0,0,0,0.65)]">
        {/* background sheen */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]">
          <div className="absolute -top-24 left-1/2 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -bottom-24 left-1/4 h-[320px] w-[320px] rounded-full bg-purple-500/20 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.07),transparent_35%,rgba(255,255,255,0.03))]" />
        </div>

        <div className="relative p-6 sm:p-7">
          {/* Header */}
          <DialogHeader className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-white/[0.06] ring-1 ring-white/10">
                  <Shield className="size-5 text-white/85" />
                </div>
                <div>
                  <DialogTitle className="text-[18px] font-semibold tracking-tight text-white">
                    Create wallet
                  </DialogTitle>
                  <DialogDescription className="text-sm text-white/65">
                    Set a password and securely back up your recovery phrase.
                  </DialogDescription>
                </div>
              </div>

              {/* stepper */}
              <div className="flex items-center gap-2">
                <StepDot active={step >= 1} />
                <StepDot active={step >= 2} />
                <StepDot active={step >= 3} />
              </div>
            </div>
          </DialogHeader>

          {/* Body */}
          <div className="mt-5">
            {step === 1 && (
              <div className="space-y-5">
                <SectionTitle
                  icon={Lock}
                  title="Create a strong password"
                  subtitle="This encrypts your wallet locally on this device."
                />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-white/85"
                    >
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 12 characters"
                      className="h-12 rounded-2xl border-white/12 bg-white/[0.05] text-white placeholder:text-white/40 focus-visible:ring-white/20"
                    />
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Pill ok={password.length >= 12} text="12+ chars" />
                      <Pill ok={/[A-Z]/.test(password)} text="Uppercase" />
                      <Pill ok={/[a-z]/.test(password)} text="Lowercase" />
                      <Pill ok={/[0-9]/.test(password)} text="Number" />
                      <Pill ok={/[^A-Za-z0-9]/.test(password)} text="Symbol" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-white/85"
                    >
                      Confirm password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re enter your password"
                      className="h-12 rounded-2xl border-white/12 bg-white/[0.05] text-white placeholder:text-white/40 focus-visible:ring-white/20"
                    />
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className={cx(
                          "inline-flex items-center gap-1 rounded-full px-2 py-1 ring-1",
                          password.length === 0 && confirmPassword.length === 0
                            ? "bg-white/[0.04] text-white/55 ring-white/10"
                            : pwMatches
                            ? "bg-emerald-500/15 text-emerald-200 ring-emerald-400/25"
                            : "bg-rose-500/15 text-rose-200 ring-rose-400/25"
                        )}
                      >
                        {password.length === 0 && confirmPassword.length === 0 ? (
                          <>
                            <Key className="size-3" /> Matching check
                          </>
                        ) : pwMatches ? (
                          <>
                            <Check className="size-3" /> Matches
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="size-3" /> Does not match
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={handleCreatePassword}
                    className="h-12 w-full rounded-2xl font-semibold"
                    disabled={!pwIsValid || !pwMatches}
                  >
                    <Zap className="mr-2 size-4" />
                    Continue
                    <ChevronRight className="ml-auto size-4 opacity-80" />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <SectionTitle
                  icon={FileText}
                  title="Save your recovery phrase"
                  subtitle="Write it down and store it offline. Anyone with this phrase can access your funds."
                />

                {/* warning banner */}
                <div className="rounded-3xl border border-yellow-300/20 bg-yellow-500/10 p-4">
                  <div className="flex gap-3">
                    <div className="mt-0.5 flex size-10 items-center justify-center rounded-2xl bg-yellow-400/15 ring-1 ring-yellow-300/20">
                      <AlertTriangle className="size-5 text-yellow-200" />
                    </div>
                    <div className="text-sm">
                      <div className="font-semibold text-yellow-100">
                        Do not screenshot or share this phrase.
                      </div>
                      <div className="mt-1 text-yellow-100/75">
                        If you lose it, you lose access. If someone gets it, they get your wallet.
                      </div>
                    </div>
                  </div>
                </div>

                {/* reveal + copy */}
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-white/85">Recovery phrase</div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPhrase((s) => !s)}
                      className="h-10 rounded-2xl border-white/12 bg-white/[0.03] text-white hover:bg-white/[0.06]"
                    >
                      {showPhrase ? (
                        <>
                          <EyeOff className="mr-2 size-4" /> Hide
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 size-4" /> Reveal
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyPhrase}
                      disabled={!showPhrase}
                      className="h-10 rounded-2xl border-white/12 bg-white/[0.03] text-white hover:bg-white/[0.06]"
                    >
                      {copied ? (
                        <>
                          <Check className="mr-2 size-4 text-emerald-300" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 size-4" /> Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* phrase grid */}
                <div
                  className={cx(
                    "rounded-3xl border border-white/10 bg-white/[0.04] p-4",
                    !showPhrase && "select-none"
                  )}
                >
                  <div className={cx("grid grid-cols-2 gap-2 sm:grid-cols-3", !showPhrase && "blur-[6px]")}>
                    {words.map((w, i) => (
                      <div
                        key={`${w}-${i}`}
                        className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2"
                      >
                        <span className="w-5 text-xs text-white/40">{i + 1}</span>
                        <span className="truncate font-mono text-sm text-white/85">{w}</span>
                      </div>
                    ))}
                  </div>

                  {!showPhrase && (
                    <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/60">
                      <span>Reveal to view your phrase</span>
                      <span className="inline-flex items-center gap-2">
                        <ShieldCheck className="size-4" />
                        Keep it offline
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="h-12 flex-1 rounded-2xl border-white/12 bg-white/[0.03] text-white hover:bg-white/[0.06]"
                  >
                    <ChevronLeft className="mr-2 size-4" />
                    Back
                  </Button>

                  <Button
                    onClick={() => setStep(3)}
                    className="h-12 flex-1 rounded-2xl font-semibold"
                    disabled={!showPhrase}
                    title={!showPhrase ? "Reveal the phrase first" : undefined}
                  >
                    I saved it
                    <ChevronRight className="ml-auto size-4 opacity-80" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <SectionTitle
                  icon={ShieldCheck}
                  title="Verify your recovery phrase"
                  subtitle="Type all 12 words in the correct order. This confirms you saved it properly."
                />

                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                  <Label htmlFor="confirmPhrase" className="text-white/85">
                    Recovery phrase
                  </Label>

                  <textarea
                    id="confirmPhrase"
                    value={confirmedPhrase}
                    onChange={(e) => setConfirmedPhrase(e.target.value)}
                    placeholder="Enter all 12 words separated by spaces"
                    className="mt-2 w-full min-h-[150px] resize-none rounded-2xl border border-white/12 bg-white/[0.03] px-4 py-3 font-mono text-sm text-white placeholder:text-white/40 outline-none focus-visible:ring-[3px] focus-visible:ring-white/20"
                    spellCheck={false}
                    autoCapitalize="none"
                    autoCorrect="off"
                  />

                  <div className="mt-2 flex items-center justify-between text-xs text-white/55">
                    <span>Words must match exactly</span>
                    <span className={cx(confirmedCount === 12 ? "text-emerald-200" : "")}>
                      {confirmedCount}/12
                    </span>
                  </div>

                  {/* mini validation bar */}
                  {!!confirmedPhrase.trim() && (
                    <div className="mt-3 grid grid-cols-12 gap-1">
                      {Array.from({ length: 12 }).map((_, i) => {
                        const inputWords = normalizeMnemonic(confirmedPhrase).split(" ").filter(Boolean);
                        const originalWords = normalizeMnemonic(recoveryPhrase).split(" ").filter(Boolean);

                        const filled = i < inputWords.length;
                        const ok = filled && inputWords[i] === originalWords[i];

                        return (
                          <div
                            key={i}
                            className={cx(
                              "h-2 rounded-full",
                              !filled
                                ? "bg-white/10"
                                : ok
                                ? "bg-emerald-400/70"
                                : "bg-rose-400/70"
                            )}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="h-12 flex-1 rounded-2xl border-white/12 bg-white/[0.03] text-white hover:bg-white/[0.06]"
                  >
                    <ChevronLeft className="mr-2 size-4" />
                    Back
                  </Button>

                  <Button
                    onClick={handleConfirmPhrase}
                    className="h-12 flex-1 rounded-2xl font-semibold"
                  >
                    <Shield className="mr-2 size-4" />
                    Create wallet
                  </Button>
                </div>

                <div className="pt-1 text-center text-[11px] text-white/45">
                  Your phrase never leaves this device unless you copy it.
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StepDot({ active }: { active: boolean }) {
  return (
    <div
      className={cx(
        "h-2 w-2 rounded-full",
        active ? "bg-white/85" : "bg-white/20"
      )}
    />
  );
}

function SectionTitle({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex size-10 items-center justify-center rounded-2xl bg-white/[0.05] ring-1 ring-white/10">
        <Icon className="size-5 text-white/80" />
      </div>
      <div>
        <div className="text-base font-semibold text-white">{title}</div>
        <div className="mt-1 text-sm text-white/65">{subtitle}</div>
      </div>
    </div>
  );
}

function Pill({ ok, text }: { ok: boolean; text: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] ring-1",
        ok
          ? "bg-emerald-500/15 text-emerald-200 ring-emerald-400/25"
          : "bg-white/[0.04] text-white/55 ring-white/10"
      )}
    >
      {ok ? <Check className="mr-1 size-3" /> : <span className="mr-1 inline-block size-3 rounded-full bg-white/15" />}
      {text}
    </span>
  );
}
