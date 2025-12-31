import React, { useMemo, useState } from "react";
import { useWallet } from "../contexts/WalletContext";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Copy,
  Send,
  QrCode,
  ExternalLink,
  Lock,
  Settings as SettingsIcon,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  TrendingUp,
  Activity,
  PieChart,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { SendModal } from "./SendModal";
import { ReceiveModal } from "./ReceiveModal";
import { SettingsModal } from "./SettingsModal";
import { AddTokenModal } from "./AddTokenModal";
import { AccountSwitcher } from "./AccountSwitcher";
import { NetworkSwitcher } from "./NetworkSwitcher";

export function Dashboard() {
  const wallet = useWallet();
  const { address, balance, transactions, lockWallet, currentNetwork, tokens, refreshBalance } = wallet;

  const [showSend, setShowSend] = useState(false);
  const [showReceive, setShowReceive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddToken, setShowAddToken] = useState(false);
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const formatAddress = (addr: string) => `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;

  const formatDate = (timestamp: string) => {
    const d = new Date(timestamp);
    return (
      d.toLocaleDateString(undefined, { month: "short", day: "2-digit" }) +
      " " +
      d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    );
  };

  const copyAddress = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      toast.success("Address copied");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshBalance();
      toast.success("Balance refreshed");
    } catch (e) {
      console.error(e);
      toast.error("Failed to refresh");
    } finally {
      setIsRefreshing(false);
    }
  };

  const openSendForToken = (token: any) => {
    setSelectedToken({ ...token, isNative: !token.address });
    setShowSend(true);
  };

  const portfolioValue = useMemo(() => {
    const nativeValue = parseFloat(balance || "0") * 100; // mock price
    const tokenValues = (tokens || []).reduce(
      (sum: number, t: any) => sum + parseFloat(t.balance || "0") * 50,
      0
    );
    return nativeValue + tokenValues;
  }, [balance, tokens]);

  const portfolioChange = 2.5;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-xl border-0">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-2xl">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md">
                  <Wallet className="size-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">IBOSOL Wallet</h1>
                  <p className="text-sm text-gray-600 font-medium">Simple. Secure. Fast.</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <NetworkSwitcher />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="h-9 w-9 p-0 rounded-xl bg-white border-2 border-gray-200 hover:bg-gray-100 shadow-sm hover:shadow-md transition-all duration-200"
                  aria-label="Settings"
                >
                  <SettingsIcon className="size-4 text-gray-600" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={lockWallet}
                  className="h-9 w-9 p-0 rounded-xl bg-white border-2 border-gray-200 hover:bg-gray-100 shadow-sm hover:shadow-md transition-all duration-200"
                  aria-label="Lock"
                >
                  <Lock className="size-4 text-gray-600" />
                </Button>
              </div>
            </div>

            {/* Account Switcher */}
            <div className="mx-4 mt-1">
              <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-100 p-1 shadow-inner">
                <AccountSwitcher />
              </div>
            </div>

            {/* Balance Card */}
            <div className="p-6 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 mx-4 rounded-2xl shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl shadow-sm">
                      <PieChart className="size-5 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-sm text-gray-600 font-semibold">Total Balance</h2>
                      <div className="text-3xl font-bold tracking-tight mt-1 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {balance}{' '}
                        <span className="text-gray-600 text-lg font-bold">{currentNetwork.symbol}</span>
                      </div>
                    </div>
                  </div>
            
                  <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-100 px-4 py-1.5 text-sm font-bold text-gray-800 shadow-sm">
                    <TrendingUp className={`size-3 ${portfolioChange < 0 ? "rotate-180 text-red-500" : "text-green-500"}`} />
                    <span className={portfolioChange < 0 ? "text-red-600" : "text-green-600"}>
                      {portfolioChange >= 0 ? "+" : ""}
                      {portfolioChange}% (24h)
                    </span>
                  </div>
            
                  <div className="mt-3 text-sm text-gray-600 font-medium">
                    Portfolio Value: <span className="font-bold text-gray-800">${portfolioValue.toFixed(2)}</span>
                  </div>
                </div>
            
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="h-9 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-100 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <RefreshCw className={`size-3 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            
              {/* Address */}
              <div className="mt-4 flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 shadow-sm">
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Wallet Address</div>
                  <div className="font-mono text-xs font-semibold truncate mt-0.5">
                    {address ? formatAddress(address) : "—"}
                  </div>
                </div>
            
                <button
                  onClick={copyAddress}
                  className="rounded-lg border-2 border-gray-300 bg-white p-2 hover:bg-gray-100 shadow-sm transition-all duration-200 hover:shadow-md"
                  aria-label="Copy address"
                >
                  <Copy className="size-3.5 text-gray-600" />
                </button>
              </div>
            
              {/* Actions */}
              <div className="mt-5 grid grid-cols-2 gap-4">
                <Button
                  onClick={() =>
                    openSendForToken({
                      symbol: currentNetwork.symbol,
                      name: currentNetwork.name,
                      balance,
                      decimals: currentNetwork.decimals,
                    })
                  }
                  className="h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Send className="size-4 mr-1.5" />
                  Send
                </Button>
            
                <Button
                  onClick={() => setShowReceive(true)}
                  variant="outline"
                  className="h-11 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-100 font-medium text-sm shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <QrCode className="size-4 mr-1.5" />
                  Receive
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <div className="rounded-2xl border-2 border-gray-200 bg-gradient-to-b from-white to-gray-50 mx-4 mb-4 shadow-sm">
              <Tabs defaultValue="tokens" className="w-full">
                <div className="p-3 border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-2xl">
                  <TabsList className="w-full rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 p-1.5 shadow-inner">
                    <TabsTrigger
                      value="tokens"
                      className="flex-1 rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-md py-2.5 transition-all duration-200"
                    >
                      Assets
                    </TabsTrigger>
                    <TabsTrigger
                      value="transactions"
                      className="flex-1 rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-md py-2.5 transition-all duration-200"
                    >
                      Activity
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Assets */}
                <TabsContent value="tokens" className="m-0 p-4 space-y-3">
                  <div className="flex items-center justify-between py-1">
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">My Assets</h2>
                      <p className="text-xs text-gray-500 mt-0.5">Quick send and receive per token</p>
                    </div>

                    <Button size="sm" onClick={() => setShowAddToken(true)} className="h-8 rounded px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs">
                      <Plus className="size-3.5 mr-1" />
                      Add Token
                    </Button>
                  </div>

                  <AssetRow
                    symbol={currentNetwork.symbol}
                    name={currentNetwork.name}
                    balance={balance}
                    onSend={() =>
                      openSendForToken({
                        symbol: currentNetwork.symbol,
                        name: currentNetwork.name,
                        balance,
                        decimals: currentNetwork.decimals,
                      })
                    }
                    onReceive={() => setShowReceive(true)}
                  />

                  {(tokens || []).map((t: any) => (
                    <AssetRow
                      key={t.address}
                      symbol={t.symbol}
                      name={t.name}
                      balance={t.balance}
                      onSend={() => openSendForToken(t)}
                      onReceive={() => setShowReceive(true)}
                    />
                  ))}

                  {(tokens || []).length === 0 && (
                    <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-white to-gray-50 p-8 text-center shadow-sm">
                      <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-gray-100 shadow-sm">
                        <Plus className="size-6 text-gray-400" />
                      </div>
                      <div className="font-bold text-gray-900 text-lg mb-1">No Tokens Found</div>
                      <div className="mt-1 text-sm text-gray-600 mb-4">Add a token contract address to track it.</div>
                      <Button 
                        onClick={() => setShowAddToken(true)} 
                        className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        Add Token
                      </Button>
                    </div>
                  )}
                </TabsContent>

                {/* Activity */}
                <TabsContent value="transactions" className="m-0 p-4 space-y-3">
                  {transactions.length === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-white to-gray-50 p-8 text-center shadow-sm">
                      <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-gray-100 shadow-sm">
                        <Activity className="size-6 text-gray-400" />
                      </div>
                      <div className="font-bold text-gray-900 text-lg mb-1">No Transactions</div>
                      <div className="mt-1 text-sm text-gray-600">Your recent activity will appear here.</div>
                    </div>
                  ) : (
                    transactions.map((tx: any, index: number) => {
                      const isSent = tx.from?.hash?.toLowerCase() === address?.toLowerCase();
                      const other = isSent ? tx.to?.hash : tx.from?.hash;
                      const raw = tx.value ? parseInt(tx.value) : 0;
                      const amount = (raw / Math.pow(10, currentNetwork.decimals)).toFixed(4);
                
                      return (
                        <div
                          key={tx.hash || index}
                          className="rounded-xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4 shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${tx.result === "success" ? "bg-emerald-100 text-emerald-700" : tx.result === "failed" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}
                                >
                                  {tx.result || "pending"}
                                </span>
                                <span className="text-xs text-gray-500">{formatDate(tx.timestamp)}</span>
                              </div>
                
                              <div className="text-sm text-gray-700">
                                {isSent ? "Sent to" : "Received from"}{' '}
                                <span className="font-mono text-gray-900 font-medium">
                                  {other ? formatAddress(other) : "Unknown"}
                                </span>
                              </div>
                            </div>
                
                            <div className="text-right min-w-[100px]">
                              <div className={`text-base font-semibold ${isSent ? "text-rose-600" : "text-emerald-600"}`}>
                                {isSent ? "-" : "+"}
                                {amount} <span className="text-gray-500 font-medium">{currentNetwork.symbol}</span>
                              </div>
                
                              {tx.hash ? (
                                <a
                                  href={`${currentNetwork.explorerUrl}/tx/${tx.hash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline"
                                >
                                  View <ExternalLink className="size-3" />
                                </a>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <SendModal
            open={showSend}
            onClose={() => {
              setShowSend(false);
              setSelectedToken(null);
            }}
            token={selectedToken}
          />
          <ReceiveModal open={showReceive} onClose={() => setShowReceive(false)} />
          <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
          <AddTokenModal open={showAddToken} onClose={() => setShowAddToken(false)} />
        </div>
      </div>
    </div>
  );
}

function AssetRow({
  symbol,
  name,
  balance,
  onSend,
  onReceive,
}: {
  symbol: string;
  name: string;
  balance: string;
  onSend: () => void;
  onReceive: () => void;
}) {
  return (
    <div className="group rounded-xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-4">
          <div className="size-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-base">{symbol?.[0] || "?"}</span>
          </div>

          <div className="min-w-0">
            <div className="truncate text-lg font-bold text-gray-900">{symbol}</div>
            <div className="truncate text-sm text-gray-600 mt-1">{name}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right min-w-[100px]">
            <div className="text-lg font-bold text-gray-900">{balance}</div>
            <div className="text-sm text-gray-600 font-medium">{symbol}</div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              className="h-9 w-9 p-0 rounded-lg border-2 border-gray-200 hover:bg-indigo-100 text-gray-600 hover:text-indigo-600 shadow-sm hover:shadow-md transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                onSend();
              }}
              aria-label="Send"
            >
              <ArrowUpRight className="size-4" />
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="h-9 w-9 p-0 rounded-lg border-2 border-gray-200 hover:bg-indigo-100 text-gray-600 hover:text-indigo-600 shadow-sm hover:shadow-md transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                onReceive();
              }}
              aria-label="Receive"
            >
              <ArrowDownLeft className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}