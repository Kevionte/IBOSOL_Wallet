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
          <Button variant="outline" size="sm" className="h-9 bg-white hover:bg-gray-50 border-gray-300 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="size-2 bg-green-500 rounded-full"></div>
              <span className="hidden sm:inline font-medium">{currentNetwork.name}</span>
              <span className="sm:hidden font-medium">{currentNetwork.symbol}</span>
              <ChevronDown className="size-4 text-gray-500" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 mt-2 shadow-lg rounded-xl border-gray-200">
          <DropdownMenuLabel className="flex items-center gap-2 py-2">
            <Globe className="size-4 text-indigo-600" />
            <span className="font-semibold text-gray-900">Select Network</span>
          </DropdownMenuLabel>
          {networks.map((network) => (
            <DropdownMenuItem
              key={network.chainId}
              onClick={() => switchNetwork(network.chainId)}
              className="cursor-pointer py-3 px-2 hover:bg-gray-50 rounded-lg mx-1"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className={`size-3 rounded-full ${
                    network.chainId === currentNetwork.chainId ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{network.name}</div>
                    <div className="text-xs text-gray-500">
                      Chain ID: {network.chainId}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {network.chainId === currentNetwork.chainId && (
                    <Check className="size-5 text-indigo-600" />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full ml-2"
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
          <DropdownMenuSeparator className="my-1" />
          <DropdownMenuItem 
            onClick={() => setShowAddNetwork(true)}
            className="py-2 cursor-pointer hover:bg-gray-50 rounded-lg mx-1"
          >
            <Plus className="size-4 mr-2 text-indigo-600" />
            <span>Add Network</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Add Network Dialog */}
      <Dialog open={showAddNetwork} onOpenChange={setShowAddNetwork}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Add Network</DialogTitle>
            <DialogDescription>
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
                className="rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
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
                className="rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rpcUrl">RPC URL *</Label>
              <Input
                id="rpcUrl"
                value={newNetwork.rpcUrl}
                onChange={(e) => setNewNetwork({...newNetwork, rpcUrl: e.target.value})}
                placeholder="e.g. https://mainnet.infura.io/v3/..."
                className="rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
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
                  className="rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
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
                  className="rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
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
                className="rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleAddNetwork} className="flex-1">
                Add Network
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddNetwork(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Network Details Dialog */}
      <Dialog open={showNetworkDetails} onOpenChange={setShowNetworkDetails}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedNetworkForDetails?.name}</DialogTitle>
            <DialogDescription>
              Network details and settings
            </DialogDescription>
          </DialogHeader>
          
          {selectedNetworkForDetails && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Network Name</span>
                  <span className="font-medium">{selectedNetworkForDetails.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Chain ID</span>
                  <span className="font-medium">{selectedNetworkForDetails.chainId}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Currency Symbol</span>
                  <span className="font-medium">{selectedNetworkForDetails.symbol}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Decimals</span>
                  <span className="font-medium">{selectedNetworkForDetails.decimals}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">RPC URL</span>
                  <span className="font-medium text-sm text-right break-all">{selectedNetworkForDetails.rpcUrl}</span>
                </div>
                {selectedNetworkForDetails.explorerUrl && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Block Explorer</span>
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
                  className="w-full"
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