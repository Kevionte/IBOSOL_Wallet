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
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border-0 bg-gradient-to-b from-white to-gray-50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              <div className="size-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <Settings className="size-5 text-white" />
              </div>
              Settings
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar Navigation */}
            <div className="md:w-1/3">
              <div className="bg-gradient-to-b from-gray-50 to-gray-100 rounded-2xl p-4 shadow-inner border border-gray-200">
                {settingsSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl text-left transition-all duration-200 mb-2 ${
                        activeSection === section.id
                          ? 'bg-gradient-to-r from-indigo-50 to-purple-50 shadow-lg border-2 border-indigo-200'
                          : 'hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`size-8 rounded-lg flex items-center justify-center ${
                          activeSection === section.id
                            ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-sm'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          <Icon className="size-4" />
                        </div>
                        <span className={`font-medium ${activeSection === section.id ? 'text-indigo-800' : 'text-gray-700'}`}>{section.name}</span>
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
                      <div className="p-6 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl shadow-sm">
                        <Label className="text-sm font-medium text-gray-900">Current Account</Label>
                        <div className="mt-3 flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-800">{currentAccount?.name || 'Account'}</div>
                            <div className="text-sm text-gray-500 font-mono mt-1">{formatAddress(address || '')}</div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={copyAddress}
                            className="gap-1 rounded-xl h-9 shadow-sm hover:shadow-md transition-all duration-200 border-2"
                          >
                            <Copy className="size-3" />
                            Copy
                          </Button>
                        </div>
                      </div>
                      
                      <div className="p-6 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl shadow-sm">
                        <Label className="text-sm font-medium text-gray-900">Current Network</Label>
                        <div className="mt-3 flex items-center gap-3">
                          <div className="size-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full shadow-sm"></div>
                          <div>
                            <div className="font-medium text-gray-800">{currentNetwork.name}</div>
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
                      <h2 className="text-xl font-bold text-gray-900">Networks</h2>
                      <Button 
                        size="sm" 
                        onClick={() => setShowAddNetwork(!showAddNetwork)}
                        className="gap-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl h-9 shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <Plus className="size-4" />
                        Add Network
                      </Button>
                    </div>

                    {showAddNetwork && (
                      <div className="p-6 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl shadow-sm space-y-4">
                        <h3 className="font-medium text-lg text-gray-800">Add Network</h3>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label className="font-medium text-gray-700">Network Name *</Label>
                            <Input
                              value={networkName}
                              onChange={(e) => setNetworkName(e.target.value)}
                              placeholder="e.g., Ethereum Mainnet"
                              className="rounded-xl border-2 border-gray-300 py-3 transition-colors duration-200 shadow-sm h-11"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="font-medium text-gray-700">RPC URL *</Label>
                            <Input
                              value={networkRpc}
                              onChange={(e) => setNetworkRpc(e.target.value)}
                              placeholder="https://..."
                              className="rounded-xl border-2 border-gray-300 py-3 transition-colors duration-200 shadow-sm h-11"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="font-medium text-gray-700">Chain ID *</Label>
                              <Input
                                type="number"
                                value={networkChainId}
                                onChange={(e) => setNetworkChainId(e.target.value)}
                                placeholder="1"
                                className="rounded-xl border-2 border-gray-300 py-3 transition-colors duration-200 shadow-sm h-11"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="font-medium text-gray-700">Currency Symbol *</Label>
                              <Input
                                value={networkSymbol}
                                onChange={(e) => setNetworkSymbol(e.target.value)}
                                placeholder="ETH"
                                className="rounded-xl border-2 border-gray-300 py-3 transition-colors duration-200 shadow-sm h-11"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="font-medium text-gray-700">Block Explorer URL</Label>
                            <Input
                              value={networkExplorer}
                              onChange={(e) => setNetworkExplorer(e.target.value)}
                              placeholder="https://etherscan.io"
                              className="rounded-xl border-2 border-gray-300 py-3 transition-colors duration-200 shadow-sm h-11"
                            />
                          </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                          <Button onClick={handleAddNetwork} className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl h-11 shadow-md hover:shadow-lg transition-all duration-200">
                            Add Network
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setShowAddNetwork(false);
                              resetNetworkForm();
                            }}
                            className="flex-1 rounded-xl h-11 shadow-sm hover:shadow-md transition-all duration-200 border-2"
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
                          className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                            network.chainId === currentNetwork.chainId
                              ? 'bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-300 shadow-sm'
                              : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-indigo-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1" onClick={() => switchNetwork(network.chainId)}>
                              <div className="flex items-center gap-2">
                                {network.chainId === currentNetwork.chainId && (
                                  <div className="size-6 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                                    <Check className="size-4 text-white" />
                                  </div>
                                )}
                                <span className="font-medium text-gray-800">{network.name}</span>
                                {network.isCustom && (
                                  <span className="text-xs px-2 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full shadow-sm">
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
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg h-9 w-9 shadow-sm hover:shadow-md transition-all duration-200"
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
                        <div className="p-6 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl shadow-sm">
                          <Label className="text-sm font-medium text-gray-900">Export Private Key</Label>
                          <div className="mt-3 bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-xl p-4 text-sm text-yellow-800 shadow-sm">
                            <strong>Warning:</strong> Never share your private key. Anyone with your private key can access your funds.
                          </div>
                          <div className="mt-4 space-y-4">
                            <Input
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Enter password to reveal"
                              className="rounded-xl border-2 border-gray-300 py-3 transition-colors duration-200 shadow-sm h-11"
                            />
                            <Button 
                              onClick={handleExportKey} 
                              variant="outline" 
                              className="w-full gap-2 rounded-xl h-11 shadow-sm hover:shadow-md transition-all duration-200 border-2"
                            >
                              <Key className="size-4" />
                              Reveal Private Key
                            </Button>
                          </div>
                        </div>

                        {showKey && privateKey && (
                          <div className="p-5 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl shadow-sm">
                            <Label className="text-sm font-medium text-gray-900">Your Private Key</Label>
                            <div className="mt-3 p-4 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-xl break-all text-sm shadow-sm">
                              {privateKey}
                            </div>
                            <Button 
                              onClick={copyPrivateKey} 
                              variant="outline" 
                              className="w-full mt-4 gap-2 rounded-xl h-11 shadow-sm hover:shadow-md transition-all duration-200 border-2"
                            >
                              <Copy className="size-4" />
                              Copy Private Key
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-2xl shadow-sm">
                        <Label className="text-sm font-medium text-red-600">Danger Zone</Label>
                        <p className="text-sm text-gray-600 mt-1 mb-4">
                          Deleting your wallet will remove all data from this device. Make sure you have backed up your recovery phrase.
                        </p>
                        <Button 
                          variant="destructive" 
                          className="w-full gap-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl h-11 shadow-md hover:shadow-lg transition-all duration-200"
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
                    <h2 className="text-xl font-bold text-gray-900">Alerts</h2>
                    <div className="p-8 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl text-center shadow-sm">
                      <div className="size-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Bell className="size-8 text-indigo-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">Alert Settings</h3>
                      <p className="text-gray-500">Coming soon...</p>
                    </div>
                  </div>
                )}

                {/* About Section */}
                {activeSection === 'about' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900">About</h2>
                    <div className="p-6 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl shadow-sm">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="size-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                          <Settings className="size-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-800">IBOSOL Wallet</h3>
                          <p className="text-gray-500">Version 1.0.0</p>
                        </div>
                      </div>
                                      
                      <div className="space-y-4">
                        <div className="p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                          <h4 className="font-medium text-gray-800 mb-2">Built for the IBOSOL Network</h4>
                          <p className="text-sm text-gray-600">
                            A secure and user-friendly wallet for managing your IBOSOL assets.
                          </p>
                        </div>
                                        
                        <div className="grid grid-cols-2 gap-4">
                          <Button variant="outline" className="flex flex-col items-center gap-2 py-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border-2">
                            <Globe className="size-5" />
                            <span>Website</span>
                          </Button>
                          <Button variant="outline" className="flex flex-col items-center gap-2 py-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border-2">
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
        <AlertDialogContent className="rounded-2xl shadow-2xl border-0 bg-gradient-to-b from-white to-gray-50">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
              <div className="size-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                <LogOut className="size-5 text-white" />
              </div>
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              This action cannot be undone. This will permanently delete your wallet from this device.
              Make sure you have backed up your recovery phrase or private key.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl h-11 shadow-sm hover:shadow-md transition-all duration-200 border-2">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteWallet} 
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl h-11 shadow-md hover:shadow-lg transition-all duration-200"
            >
              Delete Wallet
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}