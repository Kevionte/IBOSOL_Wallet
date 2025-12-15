import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useWallet, Network } from '../contexts/WalletContext';
import { toast } from 'sonner';
import { 
  Eye, 
  EyeOff, 
  Trash2, 
  Plus, 
  Check, 
  Copy, 
  Key, 
  Globe, 
  Shield, 
  Settings, 
  User, 
  Bell, 
  Palette, 
  Lock, 
  LogOut,
  ChevronRight,
  Info
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { 
    address,
    currentAccount,
    exportPrivateKey, 
    deleteWallet, 
    networks, 
    currentNetwork, 
    switchNetwork,
    addNetwork,
    removeNetwork
  } = useWallet();
  
  const [activeSection, setActiveSection] = useState('general');
  const [password, setPassword] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [privateKey, setPrivateKey] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Network form
  const [showAddNetwork, setShowAddNetwork] = useState(false);
  const [networkName, setNetworkName] = useState('');
  const [networkRpc, setNetworkRpc] = useState('');
  const [networkChainId, setNetworkChainId] = useState('');
  const [networkSymbol, setNetworkSymbol] = useState('');
  const [networkExplorer, setNetworkExplorer] = useState('');

  const handleExportKey = () => {
    if (!password) {
      toast.error('Please enter your password');
      return;
    }

    const key = exportPrivateKey(password);
    if (!key) {
      toast.error('Incorrect password');
      setPassword('');
      return;
    }

    setPrivateKey(key);
    setShowKey(true);
    toast.success('Private key revealed');
  };

  const copyPrivateKey = () => {
    navigator.clipboard.writeText(privateKey);
    toast.success('Private key copied to clipboard');
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(address || '');
    toast.success('Address copied to clipboard');
  };

  const handleDeleteWallet = () => {
    deleteWallet();
    setShowDeleteDialog(false);
    onClose();
    toast.success('Wallet deleted successfully');
  };

  const handleAddNetwork = () => {
    if (!networkName || !networkRpc || !networkChainId || !networkSymbol) {
      toast.error('Please fill in all required fields');
      return;
    }

    const chainId = parseInt(networkChainId);
    if (isNaN(chainId)) {
      toast.error('Invalid Chain ID');
      return;
    }

    if (networks.some(n => n.chainId === chainId)) {
      toast.error('Network with this Chain ID already exists');
      return;
    }

    const newNetwork: Network = {
      chainId,
      name: networkName,
      rpcUrl: networkRpc,
      symbol: networkSymbol.toUpperCase(),
      decimals: 18,
      explorerUrl: networkExplorer,
      isCustom: true,
    };

    addNetwork(newNetwork);
    toast.success('Network added successfully');
    resetNetworkForm();
    setShowAddNetwork(false);
  };

  const resetNetworkForm = () => {
    setNetworkName('');
    setNetworkRpc('');
    setNetworkChainId('');
    setNetworkSymbol('');
    setNetworkExplorer('');
  };

  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // Settings navigation items
  const settingsSections = [
    { id: 'general', name: 'General', icon: User },
    { id: 'networks', name: 'Networks', icon: Globe },
    { id: 'security', name: 'Security & Privacy', icon: Shield },
    { id: 'alerts', name: 'Alerts', icon: Bell },
    { id: 'about', name: 'About', icon: Info },
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="size-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <Settings className="size-4 text-indigo-600" />
              </div>
              Settings
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar Navigation */}
            <div className="md:w-1/3">
              <div className="bg-gray-50 rounded-xl p-2">
                {settingsSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                        activeSection === section.id
                          ? 'bg-white shadow-sm border border-gray-200'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`size-4 ${activeSection === section.id ? 'text-indigo-600' : 'text-gray-500'}`} />
                        <span className="font-medium">{section.name}</span>
                      </div>
                      <ChevronRight className={`size-4 ${activeSection === section.id ? 'text-indigo-600' : 'text-gray-400'}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content Area */}
            <div className="md:w-2/3">
              <div className="space-y-6">
                {/* General Section */}
                {activeSection === 'general' && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-900">General</h2>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-white border border-gray-200 rounded-xl">
                        <Label className="text-sm font-medium text-gray-900">Current Account</Label>
                        <div className="mt-3 flex items-center justify-between">
                          <div>
                            <div className="font-medium">{currentAccount?.name || 'Account'}</div>
                            <div className="text-sm text-gray-500 font-mono">{formatAddress(address || '')}</div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={copyAddress}
                            className="gap-1"
                          >
                            <Copy className="size-3" />
                            Copy
                          </Button>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-white border border-gray-200 rounded-xl">
                        <Label className="text-sm font-medium text-gray-900">Current Network</Label>
                        <div className="mt-3 flex items-center gap-3">
                          <div className="size-2 bg-green-500 rounded-full"></div>
                          <div>
                            <div className="font-medium">{currentNetwork.name}</div>
                            <div className="text-sm text-gray-500">Chain ID: {currentNetwork.chainId}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Networks Section */}
                {activeSection === 'networks' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900">Networks</h2>
                      <Button 
                        size="sm" 
                        onClick={() => setShowAddNetwork(!showAddNetwork)}
                        className="gap-1"
                      >
                        <Plus className="size-4" />
                        Add Network
                      </Button>
                    </div>

                    {showAddNetwork && (
                      <div className="p-4 bg-white border border-gray-200 rounded-xl space-y-4">
                        <h3 className="font-medium">Add Network</h3>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label>Network Name *</Label>
                            <Input
                              value={networkName}
                              onChange={(e) => setNetworkName(e.target.value)}
                              placeholder="e.g., Ethereum Mainnet"
                              className="rounded-lg"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>RPC URL *</Label>
                            <Input
                              value={networkRpc}
                              onChange={(e) => setNetworkRpc(e.target.value)}
                              placeholder="https://..."
                              className="rounded-lg"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Chain ID *</Label>
                              <Input
                                type="number"
                                value={networkChainId}
                                onChange={(e) => setNetworkChainId(e.target.value)}
                                placeholder="1"
                                className="rounded-lg"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Currency Symbol *</Label>
                              <Input
                                value={networkSymbol}
                                onChange={(e) => setNetworkSymbol(e.target.value)}
                                placeholder="ETH"
                                className="rounded-lg"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Block Explorer URL</Label>
                            <Input
                              value={networkExplorer}
                              onChange={(e) => setNetworkExplorer(e.target.value)}
                              placeholder="https://etherscan.io"
                              className="rounded-lg"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleAddNetwork} className="flex-1">
                            Add Network
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setShowAddNetwork(false);
                              resetNetworkForm();
                            }}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      {networks.map((network) => (
                        <div
                          key={network.chainId}
                          className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            network.chainId === currentNetwork.chainId
                              ? 'bg-indigo-50 border-indigo-300'
                              : 'bg-white border-gray-200 hover:border-indigo-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1" onClick={() => switchNetwork(network.chainId)}>
                              <div className="flex items-center gap-2">
                                {network.chainId === currentNetwork.chainId && (
                                  <Check className="size-4 text-indigo-600" />
                                )}
                                <span className="font-medium">{network.name}</span>
                                {network.isCustom && (
                                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                                    Custom
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                Chain ID: {network.chainId} • {network.symbol}
                              </div>
                            </div>
                            {network.isCustom && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e:any) => {
                                  e.stopPropagation();
                                  if (confirm(`Remove ${network.name}?`)) {
                                    removeNetwork(network.chainId);
                                  }
                                }}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Security Section */}
                {activeSection === 'security' && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-900">Security & Privacy</h2>
                    
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="p-4 bg-white border border-gray-200 rounded-xl">
                          <Label className="text-sm font-medium text-gray-900">Export Private Key</Label>
                          <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                            <strong>Warning:</strong> Never share your private key. Anyone with your private key can access your funds.
                          </div>
                          <div className="mt-3 space-y-3">
                            <Input
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Enter password to reveal"
                              className="rounded-lg"
                            />
                            <Button 
                              onClick={handleExportKey} 
                              variant="outline" 
                              className="w-full gap-2"
                            >
                              <Key className="size-4" />
                              Reveal Private Key
                            </Button>
                          </div>
                        </div>

                        {showKey && privateKey && (
                          <div className="p-4 bg-white border border-gray-200 rounded-xl">
                            <Label className="text-sm font-medium text-gray-900">Your Private Key</Label>
                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg break-all text-sm">
                              {privateKey}
                            </div>
                            <Button 
                              onClick={copyPrivateKey} 
                              variant="outline" 
                              className="w-full mt-3 gap-2"
                            >
                              <Copy className="size-4" />
                              Copy Private Key
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="p-4 bg-white border border-gray-200 rounded-xl">
                        <Label className="text-sm font-medium text-red-600">Danger Zone</Label>
                        <p className="text-sm text-gray-600 mt-1 mb-4">
                          Deleting your wallet will remove all data from this device. Make sure you have backed up your recovery phrase.
                        </p>
                        <Button 
                          variant="destructive" 
                          className="w-full gap-2"
                          onClick={() => setShowDeleteDialog(true)}
                        >
                          <Trash2 className="size-4" />
                          Delete Wallet
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Alerts Section */}
                {activeSection === 'alerts' && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-900">Alerts</h2>
                    <div className="p-8 bg-white border border-gray-200 rounded-xl text-center">
                      <Bell className="size-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Alert Settings</h3>
                      <p className="text-gray-500">Coming soon...</p>
                    </div>
                  </div>
                )}

                {/* About Section */}
                {activeSection === 'about' && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-900">About</h2>
                    <div className="p-6 bg-white border border-gray-200 rounded-xl">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="size-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center">
                          <Settings className="size-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">IBOSOL Wallet</h3>
                          <p className="text-gray-500">Version 1.0.0</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium mb-2">Built for the IBOSOL Network</h4>
                          <p className="text-sm text-gray-600">
                            A secure and user-friendly wallet for managing your IBOSOL assets.
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <Button variant="outline" className="flex flex-col items-center gap-2 py-4">
                            <Globe className="size-5" />
                            <span>Website</span>
                          </Button>
                          <Button variant="outline" className="flex flex-col items-center gap-2 py-4">
                            <Info className="size-5" />
                            <span>Documentation</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <LogOut className="size-5 text-red-600" />
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your wallet from this device.
              Make sure you have backed up your recovery phrase or private key.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteWallet} 
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Wallet
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}