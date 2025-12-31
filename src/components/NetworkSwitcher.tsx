import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { Button } from './ui/button';
import { ChevronDown, Check, Plus, Trash2, Globe, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';

export function NetworkSwitcher() {
  const { networks, currentNetwork, switchNetwork, addNetwork, removeNetwork } = useWallet();
  const [showAddNetwork, setShowAddNetwork] = useState(false);
  const [showNetworkDetails, setShowNetworkDetails] = useState(false);
  const [selectedNetworkForDetails, setSelectedNetworkForDetails] = useState<any>(null);
  const [newNetwork, setNewNetwork] = useState({
    chainId: '',
    rpcUrl: '',
    name: '',
    symbol: '',
    decimals: '18',
    explorerUrl: ''
  });

  const handleAddNetwork = () => {
    if (!newNetwork.chainId || !newNetwork.rpcUrl || !newNetwork.name || !newNetwork.symbol) {
      toast.error('Please fill all required fields');
      return;
    }

    const chainId = parseInt(newNetwork.chainId, 10);
    const decimals = parseInt(newNetwork.decimals, 10);

    if (isNaN(chainId) || chainId <= 0) {
      toast.error('Chain ID must be a positive number');
      return;
    }

    if (isNaN(decimals) || decimals <= 0) {
      toast.error('Decimals must be a positive number');
      return;
    }

    // Check if network already exists
    if (networks.some(n => n.chainId === chainId)) {
      toast.error('Network with this Chain ID already exists');
      return;
    }

    addNetwork({
      chainId,
      rpcUrl: newNetwork.rpcUrl,
      name: newNetwork.name,
      symbol: newNetwork.symbol.toUpperCase(),
      decimals,
      explorerUrl: newNetwork.explorerUrl || '',
      isCustom: true
    });

    toast.success('Network added successfully');
    setShowAddNetwork(false);
    setNewNetwork({
      chainId: '',
      rpcUrl: '',
      name: '',
      symbol: '',
      decimals: '18',
      explorerUrl: ''
    });
  };

  const handleRemoveNetwork = (chainId: number) => {
    const network = networks.find(n => n.chainId === chainId);
    if (network && !network.isCustom) {
      toast.error('Cannot remove default network');
      return;
    }
    
    removeNetwork(chainId);
    toast.success('Network removed');
  };

  const showNetworkDetailsModal = (network: any) => {
    setSelectedNetworkForDetails(network);
    setShowNetworkDetails(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-10 bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 border-2 border-gray-200 rounded-xl px-4 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-2">
              <div className="size-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full shadow-sm"></div>
              <span className="hidden sm:inline font-medium text-gray-800">{currentNetwork.name}</span>
              <span className="sm:hidden font-medium text-gray-800">{currentNetwork.symbol}</span>
              <ChevronDown className="size-4 text-gray-600" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72 mt-2 rounded-2xl border-0 shadow-2xl bg-gradient-to-b from-white to-gray-50">
          <DropdownMenuLabel className="flex items-center gap-2 py-3 px-4 text-sm border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-2xl">
            <Globe className="size-4 text-indigo-600" />
            <span className="font-medium text-gray-800">Select Network</span>
          </DropdownMenuLabel>
          {networks.map((network) => (
            <DropdownMenuItem
              key={network.chainId}
              onClick={() => switchNetwork(network.chainId)}
              className="cursor-pointer py-3 px-4 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 rounded-xl mx-2 my-1 transition-all duration-200 border border-transparent hover:border-indigo-100"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className={`size-3 rounded-full shadow-sm ${
                    network.chainId === currentNetwork.chainId ? 'bg-gradient-to-br from-green-500 to-emerald-500' : 'bg-gradient-to-br from-gray-400 to-gray-500'
                  }`}></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{network.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Chain ID: {network.chainId}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {network.chainId === currentNetwork.chainId && (
                    <Check className="size-4 text-indigo-600" />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                    onClick={(e:any) => {
                      e.stopPropagation();
                      showNetworkDetailsModal(network);
                    }}
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator className="my-2 bg-gradient-to-r from-gray-200 to-gray-300" />
          <DropdownMenuItem 
            onClick={() => setShowAddNetwork(true)}
            className="py-3 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-xl mx-2 mb-1 transition-all duration-200 flex items-center border border-transparent hover:border-blue-200 shadow-sm hover:shadow-md"
          >
            <div className="size-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-3 shadow-sm">
              <Plus className="size-4 text-white" />
            </div>
            <span className="font-medium text-gray-800">Add Network</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Add Network Dialog */}
      <Dialog open={showAddNetwork} onOpenChange={setShowAddNetwork}>
        <DialogContent className="sm:max-w-lg rounded-2xl shadow-2xl border-0 bg-gradient-to-b from-white to-gray-50">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Add Network
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Add a new network to your wallet
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="networkName">Network Name *</Label>
              <Input
                id="networkName"
                value={newNetwork.name}
                onChange={(e) => setNewNetwork({...newNetwork, name: e.target.value})}
                placeholder="e.g. Ethereum Mainnet"
                className="rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chainId">Chain ID *</Label>
              <Input
                id="chainId"
                type="number"
                value={newNetwork.chainId}
                onChange={(e) => setNewNetwork({...newNetwork, chainId: e.target.value})}
                placeholder="e.g. 1"
                className="rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rpcUrl">RPC URL *</Label>
              <Input
                id="rpcUrl"
                value={newNetwork.rpcUrl}
                onChange={(e) => setNewNetwork({...newNetwork, rpcUrl: e.target.value})}
                placeholder="e.g. https://mainnet.infura.io/v3/..."
                className="rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm h-11"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="symbol">Currency Symbol *</Label>
                <Input
                  id="symbol"
                  value={newNetwork.symbol}
                  onChange={(e) => setNewNetwork({...newNetwork, symbol: e.target.value})}
                  placeholder="e.g. ETH"
                  className="rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="decimals">Decimals</Label>
                <Input
                  id="decimals"
                  type="number"
                  value={newNetwork.decimals}
                  onChange={(e) => setNewNetwork({...newNetwork, decimals: e.target.value})}
                  placeholder="18"
                  className="rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm h-11"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="explorerUrl">Block Explorer URL</Label>
              <Input
                id="explorerUrl"
                value={newNetwork.explorerUrl}
                onChange={(e) => setNewNetwork({...newNetwork, explorerUrl: e.target.value})}
                placeholder="e.g. https://etherscan.io"
                className="rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm h-11"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleAddNetwork} className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl h-11 shadow-md hover:shadow-lg transition-all duration-200">
                Add Network
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddNetwork(false)}
                className="flex-1 rounded-xl h-11 shadow-sm hover:shadow-md transition-all duration-200 border-2"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Network Details Dialog */}
      <Dialog open={showNetworkDetails} onOpenChange={setShowNetworkDetails}>
        <DialogContent className="sm:max-w-lg rounded-2xl shadow-2xl border-0 bg-gradient-to-b from-white to-gray-50">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {selectedNetworkForDetails?.name}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Network details and settings
            </DialogDescription>
          </DialogHeader>
          
          {selectedNetworkForDetails && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between py-3 border-b border-gray-200 bg-gray-50 rounded-lg px-3">
                  <span className="text-gray-600 font-medium">Network Name</span>
                  <span className="font-medium text-gray-800">{selectedNetworkForDetails.name}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200 bg-gray-50 rounded-lg px-3">
                  <span className="text-gray-600 font-medium">Chain ID</span>
                  <span className="font-medium text-gray-800">{selectedNetworkForDetails.chainId}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200 bg-gray-50 rounded-lg px-3">
                  <span className="text-gray-600 font-medium">Currency Symbol</span>
                  <span className="font-medium text-gray-800">{selectedNetworkForDetails.symbol}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200 bg-gray-50 rounded-lg px-3">
                  <span className="text-gray-600 font-medium">Decimals</span>
                  <span className="font-medium text-gray-800">{selectedNetworkForDetails.decimals}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200 bg-gray-50 rounded-lg px-3">
                  <span className="text-gray-600 font-medium">RPC URL</span>
                  <span className="font-medium text-sm text-right break-all text-gray-800">{selectedNetworkForDetails.rpcUrl}</span>
                </div>
                {selectedNetworkForDetails.explorerUrl && (
                  <div className="flex justify-between py-3 border-b border-gray-200 bg-gray-50 rounded-lg px-3">
                    <span className="text-gray-600 font-medium">Block Explorer</span>
                    <a 
                      href={selectedNetworkForDetails.explorerUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:underline text-sm text-right break-all"
                    >
                      {selectedNetworkForDetails.explorerUrl}
                    </a>
                  </div>
                )}
              </div>
              
              {selectedNetworkForDetails.isCustom && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleRemoveNetwork(selectedNetworkForDetails.chainId);
                    setShowNetworkDetails(false);
                  }}
                  className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl h-11 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Trash2 className="size-4 mr-2" />
                  Remove Network
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}