# IBOSOL Wallet - Complete Testing Guide

## 🎯 Overview
This guide covers all wallet functionality to ensure bug-free operation.

---

## 📋 Test Workflows

### 1. Create New Wallet ✅

**Steps:**
1. Open the app (first time)
2. Click "Create New Wallet"
3. Enter password (minimum 8 characters)
4. Confirm password (must match)
5. Click "Continue"
6. See recovery phrase (blurred by default)
7. Click "Show" to reveal the 12-word phrase
8. Copy the phrase (optional)
9. Click "I've Saved My Recovery Phrase"
10. Enter the exact 12-word phrase in the confirmation box
11. Click "Confirm & Create Wallet"

**Expected Result:**
- Wallet created successfully
- Redirected to Dashboard
- Account name: "Account 1"
- Balance shows 0.0000 IBO
- Address is visible

---

### 2. Lock & Unlock Wallet ✅

**Steps:**
1. From Dashboard, click the Lock icon (top right)
2. Wallet should lock
3. Enter your password
4. Click "Unlock Wallet"

**Expected Result:**
- Wallet unlocks successfully
- Returns to Dashboard with same account
- Balance and address intact

---

### 3. Import Wallet (First Time) ✅

**Steps:**
1. On Welcome screen, click "Import Existing Wallet"
2. Choose tab: "Recovery Phrase" or "Private Key"

**Recovery Phrase:**
- Enter 12-word recovery phrase
- Create password (min 8 chars)
- Confirm password
- Click "Import Wallet"

**Private Key:**
- Enter private key (with or without 0x)
- Create password (min 8 chars)
- Confirm password
- Click "Import Wallet"

**Expected Result:**
- Wallet imported successfully
- Redirected to Dashboard
- Correct address displayed
- Account name: "Account 1"

---

### 4. Import Additional Accounts (After Login) ✅

**Steps:**
1. From Dashboard, click on Account Switcher (top left)
2. Click "Import Account"
3. Choose "Recovery Phrase" or "Private Key" tab
4. Enter account name (e.g., "Trading Account")
5. Enter recovery phrase or private key
6. Enter your existing wallet password
7. Click "Import Account"

**Expected Result:**
- New account added to account list
- Can switch between accounts
- Each account has its own address and balance
- Transactions are specific to each account

---

### 5. Switch Between Accounts ✅

**Steps:**
1. Click on Account Switcher (top left)
2. See list of all accounts
3. Click on any account to switch

**Expected Result:**
- Active account has checkmark
- Balance updates for selected account
- Address changes
- Transactions refresh for new account
- Network remains same

---

### 6. Rename Account ✅

**Steps:**
1. Click Account Switcher
2. Click Edit icon (pencil) next to account name
3. Enter new name
4. Click "Save"

**Expected Result:**
- Account renamed successfully
- New name appears in account switcher
- Balance card shows new name

---

### 7. Remove Account ✅

**Steps:**
1. Click Account Switcher
2. Click Delete icon (trash) next to account
3. Confirm deletion

**Expected Result:**
- Account removed from list
- Cannot remove last remaining account
- Switches to another account if removing current account

---

### 8. Network Switching ✅

**Steps:**
1. Click Network Switcher (top right, next to settings)
2. See list of networks
3. Click on a network to switch

**Expected Result:**
- Active network has green dot and checkmark
- Balance resets to 0.0000 (or fetches new balance)
- Transactions clear and refetch from new network
- Network name updates throughout UI

---

### 9. Add Custom Network ✅

**Steps:**
1. Click Settings icon → Networks tab
2. Click "Add Network"
3. Enter network details:
   - Network Name
   - RPC URL
   - Chain ID
   - Currency Symbol
   - Block Explorer URL (optional)
4. Click "Add Network"

**Expected Result:**
- Network added with "Custom" badge
- Appears in network list
- Can switch to custom network
- Persists after refresh

---

### 10. Remove Custom Network ✅

**Steps:**
1. Go to Settings → Networks tab
2. Find custom network (has "Custom" badge)
3. Click trash icon
4. Confirm removal

**Expected Result:**
- Network removed from list
- Cannot remove default IBOSOL network
- If on removed network, switches to default

---

### 11. Add Custom Token ✅

**Steps:**
1. From Dashboard, click "Add Token"
2. Enter token details:
   - Contract Address (0x...)
   - Symbol (e.g., USDT)
   - Name (e.g., Tether USD)
   - Decimals (default: 18)
3. Click "Add Token"

**Expected Result:**
- Token appears in Tokens tab
- Shows balance (0 initially)
- Persists after refresh

---

### 12. Remove Custom Token ✅

**Steps:**
1. Go to Settings → Tokens tab
2. Click trash icon next to token
3. Confirm removal

**Expected Result:**
- Token removed from tokens list
- No longer appears in Dashboard

---

### 13. Send Transaction ✅

**Steps:**
1. Click "Send" button
2. Enter recipient address (0x...)
3. Enter amount
4. Click "Max" to send all (optional)
5. Review network fee
6. Click "Send"

**Expected Result:**
- Transaction submitted
- Success message shown
- Balance updates after 2 seconds
- Transaction appears in history

---

### 14. Receive Funds ✅

**Steps:**
1. Click "Receive" button
2. View QR code
3. Copy address

**Expected Result:**
- QR code displayed with correct address
- Address matches account address
- Copy button works
- Warning shows current network info

---

### 15. View Transactions ✅

**Steps:**
1. Go to Transactions tab
2. View transaction list

**Expected Result:**
- Transactions fetch from: `https://testnet-explorer.ibosol.network/backend/api/v2/addresses/{address}/transactions`
- Shows up to 10 recent transactions
- Each shows: status, date, from/to, amount
- "View" link opens explorer
- Auto-refreshes every 30 seconds

---

### 16. Export Private Key ✅

**Steps:**
1. Click Settings → Security tab
2. Enter password in "Export Private Key" section
3. Click "Reveal Private Key"
4. See private key/recovery phrase
5. Click "Copy Private Key"

**Expected Result:**
- Private key revealed only with correct password
- Can copy to clipboard
- Warning message displayed
- Only shows key for current account

---

### 17. Delete Wallet ✅

**Steps:**
1. Go to Settings → Security tab → Danger Zone
2. Click "Delete Wallet"
3. Confirm in dialog

**Expected Result:**
- All accounts deleted
- All data cleared
- Returns to Welcome screen
- Can create new wallet or import

---

### 18. Session Persistence ✅

**Steps:**
1. Create/import wallet
2. Lock wallet
3. Refresh browser
4. Should still show unlock screen
5. Unlock and verify data intact

**Expected Result:**
- Wallet state persists
- Accounts remain
- Custom networks remain
- Custom tokens remain
- Selected network remembered

---

### 19. Multiple Account Transactions ✅

**Steps:**
1. Import multiple accounts
2. Switch between accounts
3. Check transactions for each

**Expected Result:**
- Each account fetches its own transactions
- Transactions don't mix between accounts
- Balance is specific to each account
- Explorer API called with correct address

---

### 20. Network + Account Switching ✅

**Steps:**
1. Have multiple accounts and networks
2. Switch network
3. Switch account
4. Switch network again

**Expected Result:**
- Balance updates correctly
- Transactions refresh
- No data mixing
- UI updates properly

---

## 🐛 Common Issues to Check

### ✅ Password Validation
- Minimum 8 characters enforced
- Password confirmation required
- Import account uses same password as wallet

### ✅ Address Validation
- Send: must be 0x + 40 hex chars
- Token contract: must be 0x + 40 hex chars

### ✅ Recovery Phrase
- Must be exactly 12 words
- Hidden by default during creation
- Confirmation required before wallet creation

### ✅ Account Management
- Cannot remove last account
- Account names are unique identifiers
- Private key export shows current account's key

### ✅ Network Management
- Cannot remove default network
- Chain IDs must be unique
- Network switch clears transactions

### ✅ Transaction History
- Fetches from correct explorer URL
- Shows correct address transactions
- Refreshes on account switch
- Refreshes on network switch

---

## 🔒 Security Checks

✅ Passwords encrypted with AES  
✅ Private keys never stored in plain text  
✅ Recovery phrase confirmation required  
✅ Warning messages for sensitive operations  
✅ No PII collection  

---

## 📱 Responsive Design

✅ Works on desktop (1920x1080)  
✅ Works on tablet (768px)  
✅ Works on mobile (375px)  
✅ Account switcher adapts to small screens  
✅ Network switcher shows symbol on mobile  

---

## ✨ Final Checklist

- [ ] Create wallet with recovery phrase confirmation
- [ ] Import wallet with phrase and private key
- [ ] Lock/unlock wallet
- [ ] Import additional accounts
- [ ] Switch between accounts
- [ ] Rename and remove accounts
- [ ] Switch networks
- [ ] Add and remove custom networks
- [ ] Add and remove custom tokens
- [ ] Send transactions
- [ ] Receive with QR code
- [ ] View transaction history (correct API)
- [ ] Export private key
- [ ] Delete wallet
- [ ] All data persists after refresh
- [ ] No console errors
- [ ] All toast notifications work
- [ ] Responsive on all screen sizes

---

## 🎉 Success Criteria

All workflows complete without errors ✅  
Transaction history fetches from correct URL ✅  
Multiple accounts work independently ✅  
Network switching works seamlessly ✅  
Data persists across sessions ✅  
UI is responsive and bug-free ✅
