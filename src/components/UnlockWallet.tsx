"use client";

import React, { useMemo, useState } from "react";
import { useWallet } from "../contexts/WalletContext";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, ShieldCheck, Loader2 } from "lucide-react";

export function UnlockWallet() {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [shake, setShake] = useState(false);

  const { unlockWallet } = useWallet();

  const canSubmit = useMemo(() => password.trim().length > 0 && !isBusy, [password, isBusy]);

  const strength = useMemo(() => {
    const p = password;
    if (!p) return { label: "—", score: 0 };
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    const label =
      score <= 1 ? "Weak" : score === 2 ? "Fair" : score === 3 ? "Good" : score === 4 ? "Strong" : "Very strong";
    return { label, score };
  }, [password]);

  const runShake = () => {
    setShake(true);
    window.setTimeout(() => setShake(false), 420);
  };

  const handleUnlock = async () => {
    const pw = password.trim();

    if (!pw) {
      toast.error("Please enter your password");
      runShake();
      return;
    }

    setIsBusy(true);
    try {
      const success = unlockWallet(pw);
      if (!success) {
        toast.error("Incorrect password");
        runShake();
        return;
      }
      toast.success("Wallet unlocked");
      setPassword("");
    } finally {
      setIsBusy(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleUnlock();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      {/* subtle decorative blobs (same vibe as WelcomeScreen) */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute top-44 left-[18%] h-72 w-72 rounded-full bg-purple-200/35 blur-3xl" />
        <div className="absolute bottom-12 right-[18%] h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg">
            <Lock className="size-6 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-slate-900">Unlock Wallet</h1>
          <p className="mt-2 text-sm text-slate-600">Enter your password to continue</p>
        </div>

        {/* Card */}
        <div
          className={[
            "rounded-3xl border border-slate-200/70 bg-white/80 backdrop-blur-xl shadow-[0_24px_70px_-40px_rgba(15,23,42,0.35)]",
            shake ? "animate-[shake_.42s_ease-in-out]" : "",
          ].join(" ")}
        >
          {/* top accent strip */}
          <div className="px-6 pt-6">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                <span className="inline-flex size-2 rounded-full bg-emerald-500" />
                Local encrypted vault
              </div>

              <div className="text-xs text-slate-500">
                Strength: <span className="font-semibold text-slate-800">{strength.label}</span>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6 pt-5">
            <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-800">
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={onKeyDown}
                type={show ? "text" : "password"}
                placeholder="Your wallet password"
                autoFocus
                autoComplete="current-password"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 pr-12 text-sm text-slate-900 shadow-sm outline-none transition
                           focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
              />

              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                aria-label={show ? "Hide password" : "Show password"}
              >
                {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* strength bar */}
            <div className="mt-3 flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={[
                    "h-1.5 flex-1 rounded-full",
                    i < strength.score ? "bg-gradient-to-r from-indigo-600 to-purple-600" : "bg-slate-200",
                  ].join(" ")}
                />
              ))}
            </div>

            <button
              onClick={handleUnlock}
              disabled={!canSubmit}
              className={[
                "mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl font-semibold transition",
                canSubmit
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:opacity-95 active:translate-y-[1px]"
                  : "cursor-not-allowed bg-slate-200 text-slate-500",
              ].join(" ")}
            >
              {isBusy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5" />}
              {isBusy ? "Unlocking..." : "Unlock"}
            </button>

            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mt-0.5 rounded-xl bg-white p-2 text-slate-700 shadow-sm border border-slate-100">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Security tip</div>
                <div className="mt-0.5 text-sm text-slate-600">
                  Never share your password. If you forget it, you’ll need your recovery phrase.
                </div>
              </div>
            </div>

            <div className="mt-5 text-center text-xs text-slate-500">
              IBOSOL Wallet • Secure local encryption
            </div>
          </div>
        </div>

        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-6px); }
            40% { transform: translateX(6px); }
            60% { transform: translateX(-4px); }
            80% { transform: translateX(4px); }
          }
        `}</style>
      </div>
    </div>
  );
}
