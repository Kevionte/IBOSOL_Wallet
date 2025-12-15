import React, { useState } from "react";
import { useWallet } from "../contexts/WalletContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "./ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { ChevronDown, Check, Plus, Key, Edit2, Trash2, Wallet } from "lucide-react";
import { CreateWalletModal } from "./CreateWalletModal";
import { ImportAccountModal } from "./ImportAccountModal";
import { generateSecureRecoveryPhrase } from "../lib/mnemonic";

export function AccountSwitcher() {
  const {
    accounts,
    currentAccount,
    switchAccount,
    importAccount,
    importAccountWithKey,
    renameAccount,
    removeAccount,
  } = useWallet();
  
  const [showImport, setShowImport] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [accountToRename, setAccountToRename] = useState<any>(null);
  const [renameValue, setRenameValue] = useState("");
  const [accountToRemove, setAccountToRemove] = useState<any>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  
  const [addAccountMethod, setAddAccountMethod] = useState<"create" | "import">("create");
  const [newAccountName, setNewAccountName] = useState("");
  const [recoveryPhrase, setRecoveryPhrase] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [newAccountPassword, setNewAccountPassword] = useState("");

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const resetAddAccountForm = () => {
    setNewAccountName("");
    setRecoveryPhrase("");
    setPrivateKey("");
    setNewAccountPassword("");
  };

  const handleRename = (accountId: string, currentName: string) => {
    const account = accounts.find(a => a.id === accountId);
    if (account) {
      setAccountToRename(account);
      setRenameValue(currentName);
      setShowRename(true);
    }
  };

  const confirmRename = () => {
    if (!accountToRename || !renameValue.trim()) return;
    
    try {
      renameAccount(accountToRename.id, renameValue.trim());
      toast.success("Account renamed successfully");
      setShowRename(false);
      setAccountToRename(null);
      setRenameValue("");
    } catch (error: any) {
      toast.error(error?.message || "Failed to rename account");
    }
  };

  const handleRemove = (accountId: string, accountName: string) => {
    const account = accounts.find(a => a.id === accountId);
    if (account) {
      setAccountToRemove(account);
      setShowRemoveConfirm(true);
    }
  };

  const confirmRemove = () => {
    if (!accountToRemove) return;
    
    try {
      removeAccount(accountToRemove.id);
      toast.success("Account removed successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to remove account");
    } finally {
      setShowRemoveConfirm(false);
      setAccountToRemove(null);
    }
  };

  const handleAddAccount = () => {
    if (!newAccountPassword) {
      toast.error("Please enter your wallet password");
      return;
    }

    const name = newAccountName.trim() || `Account ${accounts.length + 1}`;

    try {
      if (addAccountMethod === "create") {
        // Generate a secure recovery phrase
        const phrase = generateSecureRecoveryPhrase(12);
        
        importAccount(newAccountPassword, phrase, name);

        toast.success(
          "Account created successfully. Back up your recovery phrase safely."
        );
      } else {
        const phraseRaw = recoveryPhrase.trim();
        const pk = privateKey.trim();

        if (!phraseRaw && !pk) {
          toast.error("Please provide either a recovery phrase or private key");
          return;
        }

        if (phraseRaw) {
          // Simple validation - check if it looks like a mnemonic
          const words = phraseRaw.split(/\s+/).filter(w => w.length > 0);
          if (words.length < 12) {
            toast.error("Recovery phrase should have at least 12 words");
            return;
          }

          importAccount(newAccountPassword, phraseRaw, name);
          toast.success("Account imported successfully");
        } else {
          // Private key import (you can add stricter hex checks here if you want)
          importAccountWithKey(newAccountPassword, pk, name);
          toast.success("Account imported successfully");
        }
      }

      setShowAddAccount(false);
      resetAddAccountForm();
    } catch (error: any) {
      toast.error(
        error?.message ||
          (addAccountMethod === "create"
            ? "Failed to create account"
            : "Failed to import account")
      );
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between bg-white hover:bg-gray-50 border-gray-300 shadow-sm">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="size-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-white shadow">
                <span className="text-sm font-bold text-white">
                  {currentAccount?.name?.[0] || "A"}
                </span>
              </div>
              <div className="text-left overflow-hidden">
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {currentAccount?.name || "Account"}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {currentAccount ? formatAddress(currentAccount.address) : ""}
                </div>
              </div>
            </div>
            <ChevronDown className="size-4 ml-2 flex-shrink-0 text-gray-500" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-80 mt-2 shadow-lg rounded-xl border-gray-200" align="start">
          <DropdownMenuLabel className="flex items-center gap-2 py-2">
            <Wallet className="size-4 text-indigo-600" />
            <span className="font-semibold text-gray-900">My Accounts</span>
          </DropdownMenuLabel>

          <DropdownMenuGroup className="max-h-60 overflow-y-auto">
            {accounts.map((account: any) => (
              <DropdownMenuItem
                key={account.id}
                className="flex items-center justify-between cursor-pointer py-3 px-2 hover:bg-gray-50 rounded-lg mx-1"
                onSelect={(e) => e.preventDefault()}
              >
                <div
                  className="flex items-center gap-3 flex-1 min-w-0"
                  onClick={() => switchAccount(account.id)}
                >
                  <div className="size-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-500 border-2 shadow">
                    <span className="text-sm font-bold">
                      {account.name?.[0] || "A"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {account.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {formatAddress(account.address)}
                    </div>
                  </div>
                  {currentAccount?.id === account.id && (
                    <Check className="size-5 text-indigo-600 flex-shrink-0" />
                  )}
                </div>

                <div className="flex gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRename(account.id, account.name);
                    }}
                  >
                    <Edit2 className="size-3.5" />
                  </Button>

                  {accounts.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(account.id, account.name);
                      }}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="my-1" />

          <DropdownMenuItem
            onClick={() => {
              setAddAccountMethod("create");
              setShowAddAccount(true);
            }}
            className="py-2 cursor-pointer hover:bg-gray-50 rounded-lg mx-1"
          >
            <Plus className="size-4 mr-2 text-indigo-600" />
            <span>Create Account</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              setAddAccountMethod("import");
              setShowAddAccount(true);
            }}
            className="py-2 cursor-pointer hover:bg-gray-50 rounded-lg mx-1"
          >
            <Key className="size-4 mr-2 text-indigo-600" />
            <span>Import Account</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Legacy modals */}
      <ImportAccountModal open={showImport} onClose={() => setShowImport(false)} />
      <CreateWalletModal open={showCreate} onClose={() => setShowCreate(false)} />

      {/* Add Account Dialog */}
      <Dialog
        open={showAddAccount}
        onOpenChange={(open) => {
          setShowAddAccount(open);
          if (!open) resetAddAccountForm();
        }}
      >
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {addAccountMethod === "create" ? "Create Account" : "Import Account"}
            </DialogTitle>
            <DialogDescription>
              {addAccountMethod === "create"
                ? "Create a new account with a securely generated recovery phrase."
                : "Import an existing account using a recovery phrase or private key."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="newAccountName">Account Name</Label>
              <Input
                id="newAccountName"
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
                placeholder={`Account ${accounts.length + 1}`}
                className="rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {addAccountMethod === "import" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="recoveryPhrase">Recovery Phrase (12 words)</Label>
                  <textarea
                    id="recoveryPhrase"
                    value={recoveryPhrase}
                    onChange={(e) => setRecoveryPhrase(e.target.value)}
                    placeholder="Enter your 12-word recovery phrase"
                    className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-indigo-500 focus:border-indigo-500"
                    spellCheck={false}
                    autoCapitalize="none"
                    autoCorrect="off"
                  />
                </div>

                <div className="relative flex items-center">
                  <div className="flex-grow border-t border-gray-300" />
                  <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
                  <div className="flex-grow border-t border-gray-300" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="privateKey">Private Key</Label>
                  <Input
                    id="privateKey"
                    type="password"
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    placeholder="Enter your private key"
                    className="rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                    autoCapitalize="none"
                    autoCorrect="off"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="accountPassword">Wallet Password</Label>
              <Input
                id="accountPassword"
                type="password"
                value={newAccountPassword}
                onChange={(e) => setNewAccountPassword(e.target.value)}
                placeholder="Enter your wallet password"
                className="rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleAddAccount} className="flex-1">
                {addAccountMethod === "create" ? "Create Account" : "Import Account"}
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setShowAddAccount(false);
                  resetAddAccountForm();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rename Account Dialog */}
      <Dialog open={showRename} onOpenChange={setShowRename}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle>Rename Account</DialogTitle>
            <DialogDescription>
              Enter a new name for your account
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="renameValue">Account Name</Label>
              <Input
                id="renameValue"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                placeholder="Enter account name"
                className="rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                onKeyDown={(e) => e.key === "Enter" && confirmRename()}
              />
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button onClick={confirmRename} className="flex-1">
                Save Changes
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowRename(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Account Confirmation */}
      <Dialog open={showRemoveConfirm} onOpenChange={setShowRemoveConfirm}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle>Remove Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this account? This action cannot be undone.
              Make sure you have backed up your recovery phrase or private key.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="font-medium text-red-800">
              {accountToRemove?.name}
            </div>
            <div className="text-sm text-red-600">
              {accountToRemove && formatAddress(accountToRemove.address)}
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={confirmRemove} 
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              Remove Account
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowRemoveConfirm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}