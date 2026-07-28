# Troubleshooting Guide: Local Setup

This guide provides practical fixes for common setup failures when running the Aegis RWA Dashboard locally.

## Prerequisites Check
Ensure you have the following installed before starting:
- **Node.js** (v18 or higher)
- **Freighter Wallet** browser extension

---

## 1. Environment Variables & Configuration

### Missing or Incorrect `.env.local`
**Error:** Contract calls fail silently, or the dashboard crashes when trying to mint/transfer.
**Fix:**
1. Ensure you have copied `.env.example` to `.env.local` in the root directory.
2. Verify that `NEXT_PUBLIC_RPC_URL` and `NEXT_PUBLIC_AEGIS_CONTRACT_ID` are set correctly.

### RPC and Contract ID Errors
**Error:** `Transaction submission failed` or `HostError: Error(Value, InvalidInput)`.
**Fix:** 
- Check if you are on the correct network (Testnet vs Mainnet). The `NEXT_PUBLIC_NETWORK_PASSPHRASE` must match the network of the RPC URL and the deployed contract.
- Verify the `NEXT_PUBLIC_AEGIS_CONTRACT_ID` is exactly 56 characters and starts with a `C`.

---

## 2. Freighter Wallet Setup Issues

### Wallet Not Detected
**Error:** Dashboard prompts "Please install Freighter wallet!" even though it's installed.
**Fix:**
- Refresh the page (auto-reconnect is currently being worked on).
- Ensure Freighter is unlocked and you have granted permissions to the dashboard site (`localhost:3000`).

### Incorrect Network in Wallet
**Error:** Transaction fails immediately upon signing.
**Fix:**
- Open Freighter > Settings > Network.
- Ensure the selected network in Freighter matches the network configured in your `.env.local` (e.g., Testnet).

---

## 3. Next.js & Node Errors

### Node Version Incompatibility
**Error:** `npm install` fails with `ERR! unsupported engine` or `SyntaxError: Unexpected token`.
**Fix:** 
- The dashboard requires Node.js v18+.
- Use [NVM](https://github.com/nvm-sh/nvm) to switch versions: `nvm install 18 && nvm use 18`.

### Next.js Cache Issues
**Error:** Changes to `.env.local` or components are not reflecting.
**Fix:**
- Stop the development server (`Ctrl + C`).
- Clear the Next.js cache by running: 
  ```bash
  rm -rf .next
  ```
- Restart the server: `npm run dev`.

---

## Support & Diagnostics
If you're still experiencing issues:
1. Check the browser console (`F12`) for specific error messages.
2. Run `npm run lint` and `npm run build` locally to catch compilation errors.
3. Open an issue on GitHub with your console logs and `.env.local` configuration (remember to redact any sensitive private keys).
