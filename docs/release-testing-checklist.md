# Aegis Dashboard — Release Testing Checklist

This checklist provides a repeatable manual testing process for every Aegis Dashboard release. Complete all sections before merging a release candidate.

---

## 1. Environment Setup

- [ ] `npm install` completes without errors
- [ ] `npm run build` completes without errors or type failures
- [ ] `npm run lint` passes with no warnings
- [ ] Development server starts (`npm run dev`) and loads at `http://localhost:3000`
- [ ] Production build serves correctly (`npm run build && npm start`)
- [ ] Freighter wallet extension is installed and unlocked in the test browser
- [ ] Test on both Stellar **testnet** and **mainnet** network configurations

---

## 2. Wallet Connection & Network

### Connect flow
- [ ] Click "Connect Wallet" — Freighter prompt appears
- [ ] Approve connection — navbar shows truncated address and network badge
- [ ] Wallet address displayed as `GABC...WXYZ` format (truncated)
- [ ] Network badge shows correct network (testnet/mainnet)

### Disconnect flow
- [ ] Click wallet button in navbar — wallet disconnects
- [ ] "Connect Wallet" button reappears
- [ ] Protected pages (`/portfolio`, `/admin`) show "connect wallet" prompt

### Edge cases
- [ ] Refresh page — wallet state resets (no auto-reconnect yet)
- [ ] Reconnect after disconnect works without page reload
- [ ] Freighter not installed — `alert("Please install Freighter wallet!")` appears
- [ ] Freighter locked — connection attempt handles gracefully
- [ ] Multiple rapid connect/disconnect clicks — no crash or duplicate state

---

## 3. Navigation & Layout

- [ ] Navbar renders on all pages with Aegis logo and brand link
- [ ] Logo links to `/` (home page)
- [ ] "Portfolio" link navigates to `/portfolio`
- [ ] "Admin" link navigates to `/admin`
- [ ] Active page link is visually distinct (hover state works)
- [ ] Responsive layout: navbar stacks on mobile, horizontal on desktop
- [ ] Main content area has correct padding and max-width
- [ ] No horizontal scroll on any viewport size

---

## 4. Home Page (`/`)

- [ ] Page title: "Aegis RWA Dashboard"
- [ ] Hero heading renders correctly
- [ ] "Launch App" button links to `/portfolio`
- [ ] "View GitHub" button opens external link in new tab
- [ ] Page is centered and readable on mobile and desktop

---

## 5. Admin Flows (`/admin`)

### Access control
- [ ] Unauthenticated user sees "Admin Access Required" message
- [ ] Connected wallet user sees `AdminPanel` component

### Whitelist user
- [ ] Enter a valid Stellar address in the input field
- [ ] Click "Whitelist User" — success alert appears with the address
- [ ] Button is disabled when input is empty
- [ ] Button shows loading state during processing

### Mint asset
- [ ] Enter a valid Stellar address in the input field
- [ ] Click "Mint Asset" — success alert appears
- [ ] Button is disabled when input is empty
- [ ] Button shows loading/disabled state during processing

### Edge cases
- [ ] Empty address field — buttons are disabled
- [ ] Very long address string — input handles overflow gracefully
- [ ] Special characters in address — no XSS or rendering issues
- [ ] Rapid double-click on buttons — no duplicate submissions

---

## 6. Investor / Portfolio Flows (`/portfolio`)

### Access control
- [ ] Unauthenticated user sees "Please Connect Your Wallet" message
- [ ] Connected user sees portfolio grid

### Asset display
- [ ] `AssetCard` renders for each asset with name, ticker, and balance
- [ ] Balance is formatted with commas and 2 decimal places (e.g., `50.50`, `10,000.00`)
- [ ] Ticker badge renders in brand color
- [ ] Cards have hover shadow transition

### Transfer modal
- [ ] Click "Transfer" on an asset card — modal opens with correct ticker
- [ ] Modal displays: recipient input, amount input, Cancel, Confirm Transfer
- [ ] Modal background overlay covers full viewport
- [ ] Click "Cancel" — modal closes without action
- [ ] Click outside modal — modal does NOT close (confirm intent required)

### Transfer validation
- [ ] Empty fields — error "Fill all fields" appears
- [ ] Recipient not KYC whitelisted — error "Recipient is not KYC whitelisted." appears
- [ ] Valid recipient and amount — transfer succeeds, success alert appears, modal closes
- [ ] Transfer failure — error "Transaction failed" appears
- [ ] Loading state: "Processing..." text on confirm button, button disabled

### Edge cases
- [ ] Zero amount — handled (error or validation)
- [ ] Negative amount — handled
- [ ] Very large amount (overflow) — no crash
- [ ] Non-numeric characters in amount field — prevented or handled

---

## 7. Responsive Layout

Test all pages at these breakpoints:

| Breakpoint | Width | Expected behaviour |
|---|---|---|
| Mobile | 375px | Single column, stacked navbar, full-width cards |
| Tablet | 768px | 2-column grid, horizontal nav links visible |
| Desktop | 1280px+ | 3-column grid, full navbar, max-width content |

- [ ] Home page — hero text readable, buttons stacked on mobile
- [ ] Portfolio — cards stack on mobile, grid on desktop
- [ ] Admin — input and buttons stack on mobile, horizontal on desktop
- [ ] Transfer modal — full-width on mobile, centered on desktop
- [ ] No content overflow or clipping at any breakpoint

---

## 8. Error States & Loading

- [ ] Wallet connection failure — error logged, UI remains stable
- [ ] Network disconnection — no crash, user can retry
- [ ] Slow RPC response — loading states visible (button disabled, "Processing...")
- [ ] Contract call reverts — user-facing error message displayed
- [ ] Console — no uncaught exceptions during normal flows
- [ ] Console — no React key warnings or hydration errors

---

## 9. Accessibility

- [ ] All interactive elements (buttons, inputs) are keyboard-focusable
- [ ] Tab order follows visual layout (navbar → content → buttons)
- [ ] Form inputs have associated `<label>` elements
- [ ] Color contrast meets WCAG AA for all text (4.5:1 ratio)
- [ ] Error messages are visible and not color-only (include text)
- [ ] Modal traps focus when open (Tab cycles within modal)
- [ ] Modal closes on Escape key

---

## 10. Security

- [ ] No private keys or mnemonics appear in console or network tab
- [ ] Freighter signs transactions — dashboard never handles secrets
- [ ] No `eval()` or `dangerouslySetInnerHTML` usage in components
- [ ] External links (`target="_blank"`) use `rel="noreferrer"`
- [ ] Admin page does not expose admin status to non-admin wallets (client-side gating is present, note it is not yet backed by contract-level verification)
- [ ] Transfer modal does not leak recipient addresses to third-party scripts

---

## 11. Build & Deploy

- [ ] `npm run build` produces no TypeScript errors
- [ ] `npm run build` produces no ESLint errors
- [ ] Production bundle size is reasonable (< 500 KB first load)
- [ ] Static assets (fonts, icons) load correctly in production
- [ ] Environment variables (if any) are not committed to source control
- [ ] `.env.example` documents required variables (if any)

---

## 12. Documentation

- [ ] `README.md` reflects current setup instructions
- [ ] `CONTRIBUTING.md` branching and styling rules are accurate
- [ ] `docs/architecture.md` matches current component hierarchy
- [ ] `docs/frontend-guide.md` styling conventions are up to date
- [ ] New components or pages are documented (if added in this release)

---

## Sign-off

| Tester | Date | Pass/Fail | Notes |
|---|---|---|---|
| | | | |

Release version: ___________
Tested against contract version: ___________
