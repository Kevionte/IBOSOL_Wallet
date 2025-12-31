import React, { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Wallet, Download, Shield, Zap, Globe, Lock, ChevronRight } from "lucide-react";
import { CreateWalletModal } from "./CreateWalletModal";
import { ImportWalletModal } from "./ImportWalletModal";

export function WelcomeScreen() {
  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B1020]">
      {/* Modern dark gradient background (MetaMask vibe, but cleaner) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="absolute -bottom-40 left-1/4 h-[520px] w-[520px] rounded-full bg-purple-500/25 blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 h-[520px] w-[520px] rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-10%,rgba(99,102,241,0.25),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.04),transparent_30%,rgba(255,255,255,0.02))]" />
      </div>

      {/* Centered wallet panel */}
      <div className="relative mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-14">
        <div className="w-full max-w-sm">
          <Card className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.06] p-7 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            {/* subtle top sheen */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/10 to-transparent" />
            {/* subtle noise */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.10] [background-image:url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22120%22%20height%3D%22120%22%20viewBox%3D%220%200%20120%20120%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.8%22%20numOctaves%3D%222%22%20stitchTiles%3D%22stitch%22/%3E%3C/filter%3E%3Crect%20width%3D%22120%22%20height%3D%22120%22%20filter%3D%22url(%23n)%22%20opacity%3D%220.25%22/%3E%3C/svg%3E')]" />

            {/* Header */}
            <div className="relative text-center">
              <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 shadow-[0_14px_40px_rgba(99,102,241,0.35)] ring-1 ring-white/15">
                <Wallet className="size-8 text-white" />
              </div>

              <h1 className="text-[22px] font-semibold tracking-tight text-white">
                IBOSOL Wallet
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                Create a new wallet or import an existing one to get started.
              </p>
            </div>

            {/* Action buttons */}
            <div className="relative mt-6 space-y-3">
              <Button
                onClick={() => setShowCreate(true)}
                className="h-12 w-full rounded-2xl font-semibold text-white shadow-sm transition hover:shadow-md"
              >
                <Zap className="mr-2 size-4" />
                Create wallet
                <ChevronRight className="ml-auto size-4 opacity-80" />
              </Button>

              <Button
                onClick={() => setShowImport(true)}
                variant="outline"
                className="h-12 w-full rounded-2xl font-semibold border-white/15 bg-white/[0.02] text-white hover:bg-white/[0.06]"
              >
                <Download className="mr-2 size-4" />
                Import wallet
                <ChevronRight className="ml-auto size-4 opacity-80" />
              </Button>
            </div>

            {/* Features */}
            <div className="relative mt-7 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
              <div className="grid grid-cols-3 gap-3">
                <Feature icon={Shield} title="Secure" />
                <Feature icon={Globe} title="Global" />
                <Feature icon={Lock} title="Private" />
              </div>
            </div>

            {/* Footer */}
            <div className="relative mt-5 text-center text-[11px] text-white/55">
              Keep your recovery phrase offline. We can’t recover it for you.
            </div>
          </Card>

          <div className="mt-5 text-center text-xs text-white/40">
            Tip: Use a strong password and never share your seed phrase.
          </div>
        </div>

        <CreateWalletModal open={showCreate} onClose={() => setShowCreate(false)} />
        <ImportWalletModal open={showImport} onClose={() => setShowImport(false)} />
      </div>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-2 py-3">
      <div className="flex size-10 items-center justify-center rounded-xl bg-white/[0.05] ring-1 ring-white/10">
        <Icon className="size-5 text-white/85" />
      </div>
      <div className="text-[12px] font-semibold text-white/85">{title}</div>
    </div>
  );
}
