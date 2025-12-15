import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Copy, Send, QrCode, ExternalLink, Lock, Settings as SettingsIcon, Plus, ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp, Activity, PieChart, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { SendModal } from './SendModal';
import { ReceiveModal } from './ReceiveModal';
import { SettingsModal } from './SettingsModal';
import { AddTokenModal } from './AddTokenModal';
import { AccountSwitcher } from './AccountSwitcher';
import { NetworkSwitcher } from './NetworkSwitcher';

export function Dashboard() {
  const wallet = useWallet();
  const { address, balance, transactions, lockWallet, currentNetwork, tokens, currentAccount, refreshBalance } = wallet;
  const [showSend, setShowSend] = useState(false);
  const [showReceive, setShowReceive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddToken, setShowAddToken] = useState(false);
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [tokenAction, setTokenAction] = useState<'send' | 'receive'>('send');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success('Address copied to clipboard');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshBalance();
      toast.success('Balance refreshed');
    } catch (error) {
      toast.error('Failed to refresh balance');
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const handleTokenClick = (token: any, action: 'send' | 'receive' = 'send') => {
    setSelectedToken({
      ...token,
      isNative: !token.address // Native token has no address
    });
    setTokenAction(action);
    setShowSend(true);
  };

  // Calculate portfolio value (mock calculation for demo)
  const calculatePortfolioValue = () => {
    const nativeTokenValue = parseFloat(balance || '0') * 100; // Mock price
    const tokenValues = tokens.reduce((sum, token) => {
      return sum + (parseFloat(token.balance || '0') * 50); // Mock price
    }, 0);
    return nativeTokenValue + tokenValues;
  };

  const portfolioValue = calculatePortfolioValue();
  const portfolioChange = 2.5; // Mock percentage change

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Container with max width */}
      <div className="max-w-5xl mx-auto p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Wallet className="size-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">IBOSOL Wallet</h1>
              <p className="text-xs text-gray-600">Secure cryptocurrency management</p>
            </div>
          </div>
          <div className="flex gap-2">
            <NetworkSwitcher />
            <Button variant="outline" size="sm" onClick={() => setShowSettings(true)} className="shadow-sm hover:shadow">
              <SettingsIcon className="size-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={lockWallet} className="shadow-sm hover:shadow">
              <Lock className="size-4" />
            </Button>
          </div>
        </div>

        {/* Account Switcher */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
          <AccountSwitcher />
        </div>

        {/* Portfolio Summary */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 rounded-xl p-6 text-white shadow-xl border border-indigo-400/20">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="text-xs opacity-90 mb-1 flex items-center gap-2 font-medium">
                  <PieChart className="size-4" />
                  Total Portfolio Value
                </div>
                <div className="text-3xl font-bold mb-1">${portfolioValue.toFixed(2)}</div>
                <div className={`text-xs flex items-center gap-1 px-2 py-1 rounded-full inline-flex ${portfolioChange >= 0 ? 'bg-green-500/20 text-green-100' : 'bg-red-500/20 text-red-100'}`}>
                  <TrendingUp className={`size-3 ${portfolioChange < 0 ? 'rotate-180' : ''}`} />
                  {portfolioChange >= 0 ? '+' : ''}{portfolioChange}% (24h)
                </div>
              </div>
              <div className="text-right bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <div className="text-xs opacity-90 mb-0.5 font-medium">Balance</div>
                <div className="text-2xl font-bold mb-0.5">{balance}</div>
                <div className="text-xs opacity-90">{currentNetwork.symbol}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-xs opacity-90 bg-white/10 rounded-lg px-3 py-2 border border-white/20">
              <span className="font-mono font-medium">{formatAddress(address || '')}</span>
              <button onClick={copyAddress} className="hover:opacity-80 transition-opacity ml-auto">
                <Copy className="size-3" />
              </button>
              <button 
                onClick={handleRefresh} 
                disabled={isRefreshing}
                className="hover:opacity-80 transition-opacity"
              >
                <RefreshCw className={`size-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setShowSend(true)} className="flex-1 bg-white text-indigo-600 hover:bg-gray-50 shadow-lg font-semibold py-5 text-sm">
                <Send className="size-4 mr-2" />
                Send
              </Button>
              <Button onClick={() => setShowReceive(true)} className="flex-1 bg-white text-indigo-600 hover:bg-gray-50 shadow-lg font-semibold py-5 text-sm">
                <QrCode className="size-4 mr-2" />
                Receive
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white rounded-lg p-4 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                <TrendingUp className="size-5 text-white" />
              </div>
              <div>
                <div className="text-xs text-gray-600 font-medium">24h Change</div>
                <div className="text-xl font-bold text-green-600">+2.5%</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-md">
                <Activity className="size-5 text-white" />
              </div>
              <div>
                <div className="text-xs text-gray-600 font-medium">Transactions</div>
                <div className="text-xl font-bold text-blue-600">{transactions.length}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
                <Wallet className="size-5 text-white" />
              </div>
              <div>
                <div className="text-xs text-gray-600 font-medium">Total Assets</div>
                <div className="text-xl font-bold text-purple-600">{tokens.length + 1}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <Tabs defaultValue="tokens" className="w-full">
            <TabsList className="w-full rounded-none border-b bg-gray-50 p-0 h-auto">
              <TabsTrigger 
                value="tokens" 
                className="flex-1 py-3 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:bg-white rounded-none font-semibold text-sm"
              >
                Assets
              </TabsTrigger>
              <TabsTrigger 
                value="transactions" 
                className="flex-1 py-3 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:bg-white rounded-none font-semibold text-sm"
              >
                Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tokens" className="p-4 space-y-3 m-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900">My Assets</h3>
                <Button size="sm" onClick={() => setShowAddToken(true)} className="shadow-sm">
                  <Plus className="size-4 mr-1" />
                  Add Token
                </Button>
              </div>

              {/* Native Token */}
              <div 
                className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer group"
                onClick={() => handleTokenClick({
                  symbol: currentNetwork.symbol,
                  name: currentNetwork.name,
                  balance: balance,
                  decimals: currentNetwork.decimals
                })}
              >
                <div className="flex items-center gap-4">
                  <div className="size-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-white shadow">
                    <span className="text-lg font-bold text-white">{currentNetwork.symbol[0]}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{currentNetwork.symbol}</div>
                    <div className="text-sm text-gray-500">{currentNetwork.name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{balance}</div>
                    <div className="text-sm text-gray-500">{currentNetwork.symbol}</div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-9 w-9 p-0 rounded-full border-gray-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTokenClick({
                          symbol: currentNetwork.symbol,
                          name: currentNetwork.name,
                          balance: balance,
                          decimals: currentNetwork.decimals
                        }, 'send');
                      }}
                    >
                      <ArrowUpRight className="size-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-9 w-9 p-0 rounded-full border-gray-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTokenClick({
                          symbol: currentNetwork.symbol,
                          name: currentNetwork.name,
                          balance: balance,
                          decimals: currentNetwork.decimals
                        }, 'receive');
                      }}
                    >
                      <ArrowDownLeft className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Custom Tokens */}
              {tokens.map((token) => (
                <div 
                  key={token.address} 
                  className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer group"
                  onClick={() => handleTokenClick(token)}
                >
                  <div className="flex items-center gap-4">
                    <div className="size-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center border-2 border-white shadow">
                      <span className="text-lg font-bold text-white">{token.symbol[0]}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{token.symbol}</div>
                      <div className="text-sm text-gray-500">{token.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{token.balance}</div>
                      <div className="text-sm text-gray-500">{token.symbol}</div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-9 w-9 p-0 rounded-full border-gray-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTokenClick(token, 'send');
                        }}
                      >
                        <ArrowUpRight className="size-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-9 w-9 p-0 rounded-full border-gray-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTokenClick(token, 'receive');
                        }}
                      >
                        <ArrowDownLeft className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {tokens.length === 0 && (
                <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                  <div className="size-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="size-8 text-gray-400" />
                  </div>
                  <p className="font-medium mb-1">No custom tokens added yet</p>
                  <p className="text-sm mb-4">Click "Add Token" to get started</p>
                  <Button size="sm" onClick={() => setShowAddToken(true)}>
                    Add Token
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="transactions" className="p-4 space-y-3">
              {transactions.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                  <div className="size-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="size-8 text-gray-400" />
                  </div>
                  <p className="font-medium mb-1">No transactions yet</p>
                  <p className="text-sm">Your transaction history will appear here</p>
                </div>
              ) : (
                transactions.map((tx, index) => {
                  const isSent = tx.from?.hash?.toLowerCase() === address?.toLowerCase();
                  const otherAddress = isSent ? tx.to?.hash : tx.from?.hash;
                  const txValue = tx.value ? parseInt(tx.value) : 0;
                  
                  return (
                    <div key={tx.hash || index} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            tx.result === 'success' 
                              ? 'bg-green-100 text-green-700' 
                              : tx.result === 'failed'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {tx.result || 'pending'}
                          </span>
                          <span className="text-sm text-gray-500">{formatDate(tx.timestamp)}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {isSent ? 'Sent to' : 'Received from'} {otherAddress ? formatAddress(otherAddress) : 'Unknown'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${isSent ? 'text-red-600' : 'text-green-600'}`}>
                          {isSent ? '-' : '+'}{(txValue / Math.pow(10, currentNetwork.decimals)).toFixed(4)} {currentNetwork.symbol}
                        </div>
                        <a
                          href={`${currentNetwork.explorerUrl}/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 mt-1"
                        >
                          View <ExternalLink className="size-3" />
                        </a>
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
  );
}