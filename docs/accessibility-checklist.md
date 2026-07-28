# Accessibility Review Checklist

Practical accessibility guidance for the Aegis RWA Dashboard.

This document is the reference for reviewing **any** frontend PR in this repo. Every example
below is anchored to real code in `src/` — the "Current" snippets are what ships today, and the
"Accessible pattern" snippets are what a fix should look like.

**Target:** [WCAG 2.1 Level AA](https://www.w3.org/WAI/WCAG21/quickref/?currentsidebar=%23col_customize&levels=aaa).
We are a financial dashboard that moves real-world assets — an unlabeled input or a keyboard trap
is not a cosmetic bug, it is a user losing access to their own funds.

---

## Table of contents

- [How to use this checklist](#how-to-use-this-checklist)
- [Current state of the codebase](#current-state-of-the-codebase)
- [1. Page structure and landmarks](#1-page-structure-and-landmarks)
- [2. Keyboard and focus](#2-keyboard-and-focus)
- [3. Forms and inputs](#3-forms-and-inputs)
- [4. Modals and dialogs](#4-modals-and-dialogs)
- [5. Tables and data collections](#5-tables-and-data-collections)
- [6. Navigation](#6-navigation)
- [7. Wallet, signing and transaction review flows](#7-wallet-signing-and-transaction-review-flows)
- [8. Status, errors and async feedback](#8-status-errors-and-async-feedback)
- [9. Color and contrast](#9-color-and-contrast)
- [10. Component expectations](#10-component-expectations)
- [11. How to test](#11-how-to-test)
- [12. PR checklist](#12-pr-checklist)
- [References](#references)

---

## How to use this checklist

1. Before you open a PR, walk the sections that touch your change (a form change → §3, a modal
   change → §4, anything in `Navbar.tsx` → §6).
2. Run the manual passes in [§11 How to test](#11-how-to-test). They take about five minutes.
3. Paste the block from [§12 PR checklist](#12-pr-checklist) into your PR description and tick
   what applies. Reviewers are expected to check it.

You do **not** need to fix pre-existing issues outside the scope of your PR. But do not add new
ones, and if you are already editing a component listed in
[Current state of the codebase](#current-state-of-the-codebase), fixing its row is a welcome
"easy win".

---

## Current state of the codebase

As of this document being written, **there is no `aria-*` or `role=` usage anywhere in
`src/components/`**. Accessibility has not been implemented yet. This table is the honest
starting point — treat it as the backlog, not as a description of a compliant app.

| Area | File | Issue | Section |
| --- | --- | --- | --- |
| Document | *missing* `src/pages/_document.tsx` | No `lang` attribute on `<html>` | [§1](#1-page-structure-and-landmarks) |
| Layout | `src/pages/_app.tsx:9` | `<main>` exists but has no skip link and no `id` target | [§1](#1-page-structure-and-landmarks) |
| Headings | `src/pages/portfolio.tsx:23` → `src/components/AssetCard.tsx:15` | `h1` → `h3`, level 2 skipped | [§1](#1-page-structure-and-landmarks) |
| Headings | `src/pages/admin.tsx:12`, `src/pages/portfolio.tsx:11` | Gate screens start at `h2`, no `h1` on the page | [§1](#1-page-structure-and-landmarks) |
| Nav | `src/components/Navbar.tsx:16` | Portfolio/Admin links are `hidden md:flex` — unreachable on mobile, no alternative | [§6](#6-navigation) |
| Nav | `src/components/Navbar.tsx:13` | Decorative `<Shield />` icon not hidden from assistive tech | [§6](#6-navigation) |
| Nav | `src/components/Navbar.tsx:28-33` | Disconnect button's only name is a truncated address | [§6](#6-navigation) |
| Nav | `src/components/Navbar.tsx:25-27` | Network badge is a bare `<span>`, not labelled, not a status | [§6](#6-navigation) |
| Form | `src/components/AdminPanel.tsx:24-31` | `<label>` not associated with `<input>` (no `htmlFor`/`id`) | [§3](#3-forms-and-inputs) |
| Form | `src/components/TransferModal.tsx:43-50, 53-60` | Same — two unlabelled inputs in the transfer flow | [§3](#3-forms-and-inputs) |
| Modal | `src/components/TransferModal.tsx:35-36` | No `role="dialog"`, no `aria-modal`, no `aria-labelledby` | [§4](#4-modals-and-dialogs) |
| Modal | `src/components/TransferModal.tsx:34-81` | No focus trap, no initial focus, no <kbd>Esc</kbd> to close | [§4](#4-modals-and-dialogs) |
| Modal | `src/components/PortfolioList.tsx:29-34` | Focus is not restored to the triggering button on close | [§4](#4-modals-and-dialogs) |
| Errors | `src/components/TransferModal.tsx:39` | Error banner has no `role="alert"` / `aria-live`, not linked to fields | [§8](#8-status-errors-and-async-feedback) |
| Errors | `src/components/TransferModal.tsx:17` | `"Fill all fields"` does not say *which* field failed | [§3](#3-forms-and-inputs) |
| Async | `src/components/TransferModal.tsx:76` | `Processing…` label change is not announced (`aria-busy` missing) | [§8](#8-status-errors-and-async-feedback) |
| Async | `src/components/TransferModal.tsx:27`, `AdminPanel.tsx:10,15`, `src/hooks/useWallet.ts:31` | Native `alert()` used for success/error feedback | [§8](#8-status-errors-and-async-feedback) |
| Cards | `src/components/AssetCard.tsx:26-31` | Every card has an identically named `Transfer` button | [§5](#5-tables-and-data-collections) |
| Cards | `src/components/PortfolioList.tsx:17-27` | Asset grid has no list semantics and no accessible name | [§5](#5-tables-and-data-collections) |
| Contrast | `tailwind.config.js:12-13` | White text on `aegis-brand` / `aegis-accent` fails 4.5:1 | [§9](#9-color-and-contrast) |
| Links | `src/pages/index.tsx:22` | `target="_blank"` with no "opens in new tab" cue | [§6](#6-navigation) |

---

## 1. Page structure and landmarks

- [ ] The document declares a language.
- [ ] Each page has exactly one `<h1>`, and heading levels descend without skipping.
- [ ] Page content sits inside a landmark (`<nav>`, `<main>`, `<footer>`).
- [ ] A "Skip to main content" link is the first focusable element.
- [ ] Every route sets a unique, descriptive `<title>`.

### Language

There is no `src/pages/_document.tsx` in this repo, so the rendered `<html>` element has no
`lang` attribute. Screen readers then guess the language and may read Stellar addresses and
ticker symbols with the wrong pronunciation rules (WCAG 3.1.1).

**Accessible pattern** — add `src/pages/_document.tsx`:

```tsx
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
```

### Skip link and `<main>`

`src/pages/_app.tsx:9` already renders a real `<main>` landmark — good. What is missing is a way
to bypass the navbar, and an `id` to jump to.

**Current** (`src/pages/_app.tsx:6-13`):

```tsx
<div className="min-h-screen flex flex-col">
  <Navbar />
  <main className="flex-grow p-6 md:p-12 max-w-7xl mx-auto w-full">
    <Component {...pageProps} />
  </main>
</div>
```

**Accessible pattern** — the skip link is visually hidden until focused:

```tsx
<div className="min-h-screen flex flex-col">
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded
               focus:bg-white focus:px-4 focus:py-2 focus:text-aegis-dark focus:shadow-lg"
  >
    Skip to main content
  </a>
  <Navbar />
  <main id="main-content" className="flex-grow p-6 md:p-12 max-w-7xl mx-auto w-full">
    <Component {...pageProps} />
  </main>
</div>
```

> Never use `hidden`, `display: none` or `w-0 h-0` to hide text you still want announced. Use
> Tailwind's `sr-only`, and pair it with `focus:not-sr-only` when the element is focusable.

### Heading order

**Current:** `src/pages/portfolio.tsx:23` renders the `<h1>`, then `src/components/AssetCard.tsx:15`
renders `<h3>` for each asset name. Level 2 is skipped, so a screen reader user navigating by
heading (a primary navigation mode) gets an inconsistent outline.

**Accessible pattern** — either use `<h2>` in `AssetCard`, or make the heading level a prop so the
card can be reused at any depth:

```tsx
interface AssetCardProps {
  name: string;
  ticker: string;
  balance: number;
  onTransferClick: () => void;
  headingLevel?: 2 | 3 | 4;
}

export default function AssetCard({ name, headingLevel = 2, ...rest }: AssetCardProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <div className="...">
      <Heading className="font-bold text-lg text-slate-800">{name}</Heading>
      {/* ... */}
    </div>
  );
}
```

The gate screens at `src/pages/admin.tsx:12` and `src/pages/portfolio.tsx:11` render an `<h2>` as
the only heading on the page. Promote them to `<h1>` — they are the page's title in that state.

---

## 2. Keyboard and focus

- [ ] Every interactive element is reachable with <kbd>Tab</kbd> and operable with
      <kbd>Enter</kbd> / <kbd>Space</kbd>.
- [ ] Focus order matches visual order.
- [ ] The focus indicator is always visible — never `outline-none` without a replacement.
- [ ] No keyboard trap: you can always <kbd>Tab</kbd> back out of a region.
- [ ] Focus is moved deliberately when UI appears, and restored when it disappears.
- [ ] Nothing important is available on hover only.

### `outline-none` is a recurring hazard here

Both text inputs (`src/components/TransferModal.tsx:46,56` and `src/components/AdminPanel.tsx:27`)
use `focus:ring-2 focus:ring-aegis-brand outline-none`. That is acceptable *because* a ring
replaces the outline. It is only safe in that exact combination.

**Never do this:**

```tsx
<button className="outline-none hover:bg-blue-600">Confirm</button>
```

**Do this** — and prefer `focus-visible` so mouse users don't see the ring:

```tsx
<button className="rounded focus-visible:outline-none focus-visible:ring-2
                   focus-visible:ring-aegis-brand focus-visible:ring-offset-2">
  Confirm
</button>
```

### Never build a control out of a `<div>`

If you need something clickable, use `<button type="button">`. A `<div onClick>` is invisible to
keyboards and to screen readers. If you genuinely cannot use a button, you owe all four of:
`role="button"`, `tabIndex={0}`, an `onKeyDown` handling <kbd>Enter</kbd> and <kbd>Space</kbd>,
and an accessible name. That is almost always the wrong trade.

Note that `src/components/AssetCard.tsx:12` wraps the card in a plain `<div>` with only the button
inside being interactive. That is the correct choice — keep it. Do **not** turn the whole card
into a clickable region.

---

## 3. Forms and inputs

- [ ] Every input has a programmatically associated `<label>` (`htmlFor` ↔ `id`).
- [ ] Placeholders are **never** the only label.
- [ ] Required fields are marked with `required` / `aria-required`, and visually.
- [ ] Errors identify the field, are announced, and are linked via `aria-describedby`.
- [ ] Invalid fields set `aria-invalid="true"`.
- [ ] Related controls are grouped in a `<fieldset>` with a `<legend>`.
- [ ] Submitting works with <kbd>Enter</kbd> from inside a text field.
- [ ] Inputs use the right `type`, `inputMode` and `autoComplete`.

### The core problem: labels are not associated

Both forms in the app have this bug. The `<label>` is visually adjacent but has no `htmlFor`, and
the `<input>` has no `id`. A screen reader announces "edit text, blank" with no indication of
what to type. Clicking the label also does not focus the input.

**Current** (`src/components/AdminPanel.tsx:23-32`):

```tsx
<div>
  <label className="block text-sm font-medium text-slate-700 mb-1">Target Address</label>
  <input
    type="text"
    className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-aegis-brand outline-none"
    placeholder="GABC..."
    value={address}
    onChange={(e) => setAddress(e.target.value)}
  />
</div>
```

**Accessible pattern:**

```tsx
<div>
  <label htmlFor="admin-target-address" className="block text-sm font-medium text-slate-700 mb-1">
    Target Address
  </label>
  <input
    id="admin-target-address"
    name="targetAddress"
    type="text"
    required
    autoComplete="off"
    spellCheck={false}
    aria-describedby="admin-target-address-hint"
    className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-aegis-brand outline-none"
    placeholder="GABC..."
    value={address}
    onChange={(e) => setAddress(e.target.value)}
  />
  <p id="admin-target-address-hint" className="mt-1 text-sm text-slate-600">
    Stellar public key, 56 characters, starting with G.
  </p>
</div>
```

The same fix applies to `src/components/TransferModal.tsx:43-50` (Recipient Address) and
`src/components/TransferModal.tsx:53-60` (Amount). Use `id`s scoped to the dialog, e.g.
`transfer-recipient` and `transfer-amount`.

> **Use `useId()` for reusable components.** `AdminPanel` renders once per page so a literal `id`
> is fine, but `AssetCard` renders in a loop. Any component that may appear more than once must
> derive its ids from React's `useId()` to avoid duplicate-id collisions, which break
> `htmlFor`/`aria-describedby` resolution.

### Amount fields

`src/components/TransferModal.tsx:54-60` uses `type="number"`, which is a reasonable default but
comes with caveats: spinner buttons are tiny targets, and some screen readers announce it oddly.
For token amounts prefer:

```tsx
<input
  id="transfer-amount"
  name="amount"
  type="text"
  inputMode="decimal"
  autoComplete="off"
  aria-describedby="transfer-amount-hint transfer-amount-error"
  aria-invalid={Boolean(amountError)}
  /* ... */
/>
<p id="transfer-amount-hint" className="mt-1 text-sm text-slate-600">
  Available: {formatAmount(balance)} {ticker}
</p>
```

`aria-describedby` may reference several ids; ids pointing at elements that are not rendered are
ignored, so you can list the error id unconditionally.

### Errors must identify the field

**Current** (`src/components/TransferModal.tsx:15-17`):

```tsx
const handleTransfer = async () => {
  setError('');
  if (!recipient || !amount) return setError("Fill all fields");
```

This fails WCAG 3.3.1 (Error Identification): the user is told something is wrong, but not what.
It is worse for a screen reader user, who cannot see which box is empty.

**Accessible pattern** — per-field errors, wired to the inputs:

```tsx
const [fieldErrors, setFieldErrors] = useState<{ recipient?: string; amount?: string }>({});

const validate = () => {
  const next: typeof fieldErrors = {};
  if (!recipient) next.recipient = 'Enter a recipient address.';
  if (!amount) next.amount = 'Enter an amount to transfer.';
  setFieldErrors(next);
  return Object.keys(next).length === 0;
};
```

```tsx
<input
  id="transfer-recipient"
  aria-invalid={Boolean(fieldErrors.recipient)}
  aria-describedby={fieldErrors.recipient ? 'transfer-recipient-error' : undefined}
  /* ... */
/>
{fieldErrors.recipient && (
  <p id="transfer-recipient-error" className="mt-1 text-sm text-red-700">
    {fieldErrors.recipient}
  </p>
)}
```

On failed submit, move focus to the first invalid field so the user lands on the problem.

### Use a real `<form>`

Neither form uses a `<form>` element, so <kbd>Enter</kbd> in a text field does nothing. Users
expect it to submit. Wrap the fields and use `onSubmit`:

```tsx
<form onSubmit={(e) => { e.preventDefault(); handleTransfer(); }} noValidate>
  {/* fields */}
  <button type="submit" disabled={isLoading}>Confirm Transfer</button>
</form>
```

Give every button an explicit `type`. Inside a `<form>`, a button without `type` defaults to
`submit` — which would make the "Cancel" button at `src/components/TransferModal.tsx:65-70`
submit the transfer. Cancel must be `type="button"`.

---

## 4. Modals and dialogs

- [ ] The dialog container has `role="dialog"` and `aria-modal="true"`.
- [ ] It is named by `aria-labelledby` (pointing at its heading) or `aria-label`.
- [ ] Focus moves into the dialog when it opens.
- [ ] Focus is trapped inside while it is open.
- [ ] <kbd>Esc</kbd> closes it.
- [ ] Focus returns to the element that opened it.
- [ ] Background content is inert (not tabbable, not read by screen readers).
- [ ] Body scroll is locked while it is open.

`src/components/TransferModal.tsx` currently satisfies **none** of these. It is a plain `<div>`
overlay (line 35) containing a plain `<div>` panel (line 36). A screen reader user tabbing after
it opens walks straight out of the dialog and into the page behind it, with no announcement that
a dialog appeared at all.

**Current** (`src/components/TransferModal.tsx:34-37`):

```tsx
<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
  <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
    <h2 className="text-xl font-bold mb-4">Transfer {ticker}</h2>
```

**Accessible pattern:**

```tsx
import { useEffect, useRef } from 'react';

export default function TransferModal({ ticker, onClose }: TransferModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Initial focus: the first meaningful control, not the whole document.
  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  // Escape closes; Tab is trapped inside the panel.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  // Lock background scroll while open.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="transfer-modal-title"
        className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="transfer-modal-title" className="text-xl font-bold mb-4">
          Transfer {ticker}
        </h2>
        {/* ... */}
        <button ref={closeButtonRef} type="button" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
```

Notes on the above:

- The backdrop `onClick` closes the dialog. Because the panel stops propagation, clicking inside
  is safe. This is a convenience for pointer users — <kbd>Esc</kbd> is the requirement.
- `aria-modal="true"` tells modern screen readers to ignore content outside the dialog. It does
  **not** stop <kbd>Tab</kbd>, which is why the trap above is still needed. If you would rather
  not hand-roll this, the native `<dialog>` element with `showModal()` gives you the trap,
  <kbd>Esc</kbd> and inertness for free — that is a fine alternative.
- Do not put `aria-hidden` on an ancestor of the focused element; it makes the focused control
  unreadable. Use the `inert` attribute on the page wrapper instead if you need hard inertness.

### Restoring focus is the caller's job

**Current** (`src/components/PortfolioList.tsx:29-34`): the modal is unmounted by setting
`activeTransfer` to `null`, and focus falls back to `<body>`. A keyboard user is dumped at the top
of the document and has to tab all the way back.

**Accessible pattern** — remember the trigger and restore it:

```tsx
export default function PortfolioList() {
  const [activeTransfer, setActiveTransfer] = useState<string | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const openTransfer = (ticker: string, trigger: HTMLElement) => {
    triggerRef.current = trigger;
    setActiveTransfer(ticker);
  };

  const closeTransfer = () => {
    setActiveTransfer(null);
    triggerRef.current?.focus();
  };

  return (
    <div>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockAssets.map(asset => (
          <li key={asset.id}>
            <AssetCard
              {...asset}
              onTransferClick={(event) => openTransfer(asset.ticker, event.currentTarget)}
            />
          </li>
        ))}
      </ul>

      {activeTransfer && (
        <TransferModal ticker={activeTransfer} onClose={closeTransfer} />
      )}
    </div>
  );
}
```

This requires widening `AssetCardProps.onTransferClick` from `() => void` to
`(event: React.MouseEvent<HTMLButtonElement>) => void`.

---

## 5. Tables and data collections

- [ ] Data tables use `<table>` with `<caption>`, `<thead>`, `<th scope="col|row">`.
- [ ] Layout is never done with `<table>`.
- [ ] Sortable columns expose `aria-sort` and use a `<button>` inside the `<th>`.
- [ ] Wide tables scroll in a focusable, labelled container.
- [ ] Repeated card grids use list semantics and an accessible name.
- [ ] Empty and loading states are announced, not just drawn.

> **There is no `<table>` in this repo today.** `src/components/PortfolioList.tsx:17-27` renders a
> CSS grid of `AssetCard`s. This section is therefore both a rule for the card grid *now* and the
> contract for the transaction-history / holdings table that a future PR will add.

### Card grids are lists

**Current** (`src/components/PortfolioList.tsx:17-27`): a `<div>` grid of `<div>` cards. A screen
reader user gets no count ("list of 2 items") and no boundary between assets.

**Accessible pattern:** wrap in `<ul>` / `<li>` and name the region — see the snippet in
[§4](#restoring-focus-is-the-callers-job), which already applies this. Add a name:

```tsx
<ul
  aria-label="Your tokenized assets"
  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
>
```

Tailwind's preflight removes list markers, so this costs you nothing visually.

### Ambiguous repeated buttons

**Current** (`src/components/AssetCard.tsx:26-31`): every card renders a button whose entire
accessible name is `Transfer`. A screen reader user listing the page's buttons hears
"Transfer, button. Transfer, button." with no way to tell them apart (WCAG 2.4.6).

**Accessible pattern** — keep the visible label short, extend the accessible name:

```tsx
<button
  type="button"
  onClick={onTransferClick}
  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded-lg transition"
>
  Transfer<span className="sr-only"> {name}</span>
</button>
```

`aria-label={`Transfer ${name}`}` also works, but the `sr-only` span is preferred: it keeps the
visible text as a substring of the accessible name, which matters for voice-control users
(WCAG 2.5.3, Label in Name).

### Balances

`src/components/AssetCard.tsx:24` renders `{formatAmount(balance)} {ticker}`, e.g.
"10,000.00 UST-6M". Screen readers read ticker symbols as words or spell them unpredictably. If
you shorten or symbolize a value, provide the full form:

```tsx
<p className="text-2xl font-bold text-slate-900">
  <span aria-hidden="true">{formatAmount(balance)} {ticker}</span>
  <span className="sr-only">{formatAmount(balance)} {name} tokens</span>
</p>
```

Use this sparingly — only where the abbreviation is genuinely opaque.

### When you add the real table

```tsx
<div role="region" aria-labelledby="tx-history-caption" tabIndex={0} className="overflow-x-auto">
  <table className="w-full text-left">
    <caption id="tx-history-caption" className="sr-only">
      Transaction history, most recent first
    </caption>
    <thead>
      <tr>
        <th scope="col">
          <button type="button" onClick={() => sortBy('date')}>
            Date
            <span aria-hidden="true">{sort.key === 'date' ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}</span>
          </button>
        </th>
        <th scope="col">Asset</th>
        <th scope="col">Amount</th>
        <th scope="col">Status</th>
      </tr>
    </thead>
    <tbody>
      {rows.map(row => (
        <tr key={row.hash}>
          <th scope="row">{row.date}</th>
          <td>{row.ticker}</td>
          <td>{formatAmount(row.amount)}</td>
          <td>{row.status}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

Add `aria-sort={sort.key === 'date' ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}`
to the sorted `<th>`. `tabIndex={0}` on the scroll container is what lets a keyboard user scroll
it horizontally; it requires the `role="region"` + accessible name to avoid being an unlabelled
tab stop.

### Loading and empty states

`src/components/PortfolioList.tsx:6` carries a `// TODO: add skeleton loading states`. When you
implement it, skeletons must not be silent:

```tsx
<div aria-busy={isLoading} aria-live="polite">
  {isLoading
    ? <p className="sr-only">Loading your assets…</p>
    : assets.length === 0
      ? <p>You don’t hold any tokenized assets yet.</p>
      : <ul aria-label="Your tokenized assets">{/* ... */}</ul>}
</div>
```

Decorative skeleton blocks themselves should be `aria-hidden="true"`.

---

## 6. Navigation

- [ ] Nav links live in a named `<nav>` landmark.
- [ ] The current page is marked with `aria-current="page"`.
- [ ] All destinations reachable at desktop are reachable at 320px width.
- [ ] Decorative icons are `aria-hidden="true"`; meaningful icons have a text alternative.
- [ ] Links that open a new tab say so.
- [ ] Link text makes sense out of context.

### Mobile navigation is missing, not just hidden

**Current** (`src/components/Navbar.tsx:16-19`):

```tsx
<div className="hidden md:flex space-x-4 text-sm font-medium text-slate-600">
  <Link href="/portfolio" className="hover:text-aegis-brand transition">Portfolio</Link>
  <Link href="/admin" className="hover:text-aegis-brand transition">Admin</Link>
</div>
```

Below the `md` breakpoint these links are removed from the accessibility tree entirely and no
menu button replaces them. On a phone — or on a desktop zoomed to 200%, which WCAG 1.4.4 requires
us to support — Portfolio and Admin become unreachable except by typing the URL.

**Accessible pattern** — a disclosure button that controls the list:

```tsx
const [menuOpen, setMenuOpen] = useState(false);

<button
  type="button"
  className="md:hidden"
  aria-expanded={menuOpen}
  aria-controls="primary-nav"
  onClick={() => setMenuOpen(open => !open)}
>
  <Menu aria-hidden="true" />
  <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
</button>

<ul
  id="primary-nav"
  className={`${menuOpen ? 'flex' : 'hidden'} md:flex space-x-4 text-sm font-medium text-slate-600`}
>
  <li>
    <Link href="/portfolio" aria-current={pathname === '/portfolio' ? 'page' : undefined}>
      Portfolio
    </Link>
  </li>
  <li>
    <Link href="/admin" aria-current={pathname === '/admin' ? 'page' : undefined}>
      Admin
    </Link>
  </li>
</ul>
```

`aria-expanded` must reflect state on the button that controls the menu — not on the menu itself.
Also name the landmark when a page grows a second one: `<nav aria-label="Primary">`.

### Decorative icons

**Current** (`src/components/Navbar.tsx:12-15`): the `<Shield />` icon sits next to the text
"Aegis RWA". `lucide-react` renders an `<svg>` that some screen readers announce as a graphic,
producing "graphic, Aegis RWA, link".

**Accessible pattern:**

```tsx
<Link href="/" className="flex items-center space-x-2 text-aegis-dark font-bold text-xl">
  <Shield className="text-aegis-brand" aria-hidden="true" focusable="false" />
  <span>Aegis RWA</span>
</Link>
```

Rule: if the icon sits beside text that already conveys its meaning → `aria-hidden="true"`. If the
icon is the *only* content of a control → the control needs an `aria-label` or an `sr-only` span.

### New-tab links

**Current** (`src/pages/index.tsx:22`): `target="_blank" rel="noreferrer"` with the visible text
"View GitHub". The `rel` is correct; the missing part is warning the user (WCAG 3.2.5).

**Accessible pattern:**

```tsx
<a href="https://github.com/AegisRWA" target="_blank" rel="noreferrer noopener" className="...">
  View GitHub
  <span className="sr-only"> (opens in a new tab)</span>
  <ExternalLink aria-hidden="true" className="ml-1 inline h-4 w-4" />
</a>
```

---

## 7. Wallet, signing and transaction review flows

These flows are irreversible. A user who cannot read the recipient, the amount or the compliance
result before signing can lose assets. Hold this section to a higher bar than the rest.

- [ ] Connect / disconnect controls have names that describe the **action**, not just state.
- [ ] Connection state changes are announced.
- [ ] The active network is exposed as text, not colour alone.
- [ ] Before signing, the user can review recipient and amount as unabbreviated text.
- [ ] Compliance / whitelist results are announced as they resolve.
- [ ] Pending signature states are announced and the control is `aria-busy`.
- [ ] Success and failure are announced in-page, with the transaction hash selectable.
- [ ] Nothing depends on a fixed time limit; if it does, it can be extended (WCAG 2.2.1).

### Connect / disconnect button

**Current** (`src/components/Navbar.tsx:22-43`):

```tsx
{address ? (
  <div className="flex items-center space-x-4">
    <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 font-mono">
      {network}
    </span>
    <button onClick={disconnect} className="...">
      {truncateAddress(address)}
    </button>
  </div>
) : (
  <button onClick={connect} disabled={isConnecting} className="...">
    {isConnecting ? 'Connecting...' : 'Connect Wallet'}
  </button>
)}
```

Three problems:

1. The disconnect button's accessible name is `GABC...WXYZ` (`src/utils/formatting.ts:5-8`). A
   screen reader reads it as a meaningless string; nothing says it disconnects.
2. The `{network}` badge is an unlabelled bare `<span>` — "TESTNET" read with no context, and it
   is never announced when it changes.
3. When `connect()` succeeds, the entire branch swaps. Focus was on the "Connect Wallet" button,
   which no longer exists, so focus is lost to `<body>` and nothing is announced.

**Accessible pattern:**

```tsx
{address ? (
  <div className="flex items-center space-x-4">
    <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-mono">
      <span className="sr-only">Network: </span>
      {network}
    </span>
    <button
      type="button"
      onClick={disconnect}
      className="..."
      aria-label={`Disconnect wallet ${address}`}
    >
      <span aria-hidden="true">{truncateAddress(address)}</span>
    </button>
  </div>
) : (
  <button
    type="button"
    onClick={connect}
    disabled={isConnecting}
    aria-busy={isConnecting}
    className="..."
  >
    {isConnecting ? 'Connecting…' : 'Connect Wallet'}
  </button>
)}

{/* Announces both directions of the state change. */}
<p role="status" className="sr-only">
  {address ? `Wallet connected on ${network}.` : 'Wallet disconnected.'}
</p>
```

Passing the full `address` to `aria-label` is deliberate: the truncation at
`src/utils/formatting.ts:7` is a *visual* affordance, and screen reader users need the real value
to verify which account is active.

### Compliance checks must be announced

**Current** (`src/components/TransferModal.tsx:15-32`): `checkWhitelist` takes ~800ms
(`src/hooks/useAegis.ts:10`). During that time nothing changes for a screen reader user; on
failure, `setError("Recipient is not KYC whitelisted.")` renders into a silent `<div>`. The user
presses "Confirm Transfer", hears nothing, and has no idea whether the transfer happened.

**Accessible pattern** — a status region for progress, an alert region for the outcome:

```tsx
const [status, setStatus] = useState('');

const handleTransfer = async () => {
  setError('');
  if (!validate()) return;

  setStatus('Checking recipient compliance…');
  const isCompliant = await checkWhitelist(recipient);
  if (!isCompliant) {
    setStatus('');
    return setError('Recipient is not KYC whitelisted. Transfer cancelled.');
  }

  setStatus('Awaiting signature in your wallet…');
  try {
    const hash = await transfer(recipient, parseFloat(amount));
    setStatus('');
    onSuccess(hash);           // render in-page, don't alert()
  } catch (err) {
    setStatus('');
    setError('Transaction failed. No assets were transferred.');
  }
};
```

```tsx
{/* Polite: progress updates wait for a pause in speech. */}
<p role="status" aria-live="polite" className="text-sm text-slate-600">{status}</p>

{/* Assertive: outcomes interrupt. */}
{error && (
  <div role="alert" className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">
    {error}
  </div>
)}
```

Note that `isLoading` in `src/hooks/useAegis.ts` is reset to `false` after `checkWhitelist`
resolves (line 11) and set again by `transfer` (line 17). The "Confirm Transfer" button at
`src/components/TransferModal.tsx:71-77` therefore flickers back to its enabled label mid-flow.
Do not rely on that flag alone for busy state — drive it from your own explicit status.

### Transaction review before signing

Where a confirmation step exists, present the details as a description list so each value has a
programmatic label, and never truncate the recipient in the review step:

```tsx
<dl className="space-y-2 text-sm">
  <div className="flex justify-between gap-4">
    <dt className="text-slate-600">Asset</dt>
    <dd className="font-medium">{ticker}</dd>
  </div>
  <div className="flex justify-between gap-4">
    <dt className="text-slate-600">Amount</dt>
    <dd className="font-medium">{formatAmount(Number(amount))} {ticker}</dd>
  </div>
  <div className="flex justify-between gap-4">
    <dt className="text-slate-600">Recipient</dt>
    <dd className="font-mono break-all text-right">{recipient}</dd>
  </div>
</dl>
```

### Result feedback

`src/components/TransferModal.tsx:27` uses `alert("Transfer Successful!")`, and
`src/hooks/useAegis.ts` returns a transaction hash that is discarded. `AdminPanel.tsx:10,15` and
`useWallet.ts:31` do the same. Native `alert()` is technically announced, but it steals focus,
cannot be styled or translated by the page, is dismissed by an OS-level control, and destroys the
focus position you carefully set up in the dialog. Replace it with an in-page region:

```tsx
{txHash && (
  <div role="status" className="bg-emerald-50 text-emerald-800 p-3 rounded text-sm">
    <p className="font-medium">Transfer confirmed.</p>
    <p className="font-mono break-all">
      <span className="sr-only">Transaction hash: </span>{txHash}
    </p>
  </div>
)}
```

Keep the hash as selectable text so users can copy it; if you add a copy button, give it an
accessible name and announce the result ("Transaction hash copied").

---

## 8. Status, errors and async feedback

- [ ] Async results are announced via a live region.
- [ ] `role="status"` / `aria-live="polite"` for progress and success.
- [ ] `role="alert"` / `aria-live="assertive"` for errors — sparingly.
- [ ] The live region is in the DOM **before** the message is written into it.
- [ ] Busy controls set `aria-busy` and keep an accessible name.
- [ ] Error text says what happened and what to do next.
- [ ] Errors are not conveyed by colour alone.

### Live regions must pre-exist

This is the most common mistake. A region that is mounted at the same moment its text appears is
often not announced, because the assistive tech never observed it as empty.

**Wrong** — the whole element appears at once:

```tsx
{error && <div role="alert">{error}</div>}
```

**Better** — the container is always mounted, only the text changes:

```tsx
<div role="alert" aria-live="assertive" className="min-h-[1.5rem]">
  {error && (
    <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>
  )}
</div>
```

In practice React's `role="alert"` conditional rendering works in most current screen readers, so
the conditional form is acceptable for `role="alert"` specifically. For `aria-live="polite"`
status text, always pre-mount the container.

### Busy buttons

**Current** (`src/components/TransferModal.tsx:71-77`): the label swaps to `Processing...` while
`isLoading` is true. Visually clear, silent to a screen reader.

**Accessible pattern:**

```tsx
<button
  type="submit"
  disabled={isLoading}
  aria-busy={isLoading}
  className="flex-1 bg-aegis-brand hover:bg-blue-600 text-white py-2 rounded font-medium transition disabled:opacity-50"
>
  {isLoading ? 'Processing…' : 'Confirm Transfer'}
</button>
```

Pair it with the `role="status"` region from §7 — `aria-busy` alone is not announced by every
screen reader.

> Prefer `disabled` over `aria-disabled` for buttons that are genuinely inoperable, as the code
> already does at `TransferModal.tsx:73`, `AdminPanel.tsx:37,44` and `Navbar.tsx:38`. If you need
> the control to stay focusable so the user can discover *why* it is unavailable, use
> `aria-disabled="true"` plus a no-op handler and an explanation via `aria-describedby`.

### Gate screens

`src/pages/portfolio.tsx:8-15` and `src/pages/admin.tsx:9-15` swap the entire page when no wallet
is connected. The transition in either direction is unannounced, and neither screen offers a way
to connect — the user must find the navbar button. Announce the change with `role="status"` and
put a connect action on the gate screen itself.

---

## 9. Color and contrast

- [ ] Text meets 4.5:1 (3:1 for text ≥24px, or ≥18.66px bold).
- [ ] UI component boundaries and focus indicators meet 3:1 (WCAG 1.4.11).
- [ ] Colour is never the only carrier of meaning.
- [ ] The UI is usable at 200% zoom and at 320px width.
- [ ] Nothing breaks under `prefers-reduced-motion`.

### Known failures in the current palette

Ratios below are computed against the values in `tailwind.config.js:9-15`. Re-verify with a
checker before relying on them.

| Combination | Where | Ratio | AA (normal text) |
| --- | --- | --- | --- |
| `#ffffff` on `aegis-brand` `#3b82f6` | `TransferModal.tsx:74`, `Navbar.tsx:39`, `index.tsx:19` | ~3.68:1 | ❌ fails |
| `#ffffff` on `aegis-accent` `#10b981` | `AdminPanel.tsx:38` | ~2.54:1 | ❌ fails |
| `text-red-600` on `bg-red-50` | `TransferModal.tsx:39` | ~4.4:1 | ❌ marginal fail |
| `#ffffff` on `aegis-dark` `#0f172a` | `AdminPanel.tsx:45` | ~17.9:1 | ✅ passes |
| `text-slate-500` on white | `AssetCard.tsx:23`, `Navbar.tsx:25` | ~4.76:1 | ✅ passes |

All of these are `text-sm` (14px), so the 3:1 large-text exemption does not apply.

**Fixes** — darken the text colour's background rather than restyling every button. The smallest
change is to shift the brand and accent shades used *behind white text*:

```js
// tailwind.config.js — illustrative
colors: {
  aegis: {
    dark: '#0f172a',
    brand: '#3b82f6',
    brandText: '#1d4ed8',  // blue-700, ~5.9:1 on white — for white-on-brand surfaces
    accent: '#10b981',
    accentText: '#047857', // emerald-700, ~4.8:1 on white
  }
}
```

For the error banner, `text-red-700` on `bg-red-50` clears 4.5:1 — a one-word change at
`src/components/TransferModal.tsx:39`.

Changing brand colours is a design decision. Raise it as its own issue rather than slipping it
into an unrelated PR; in the meantime, do not introduce *new* white-on-`aegis-brand` small text.

### Don't rely on colour alone

The error banner at `src/components/TransferModal.tsx:39` is red text on a red background with no
icon or prefix. Add a non-colour cue:

```tsx
<div role="alert" className="flex gap-2 bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">
  <AlertCircle aria-hidden="true" className="h-5 w-5 shrink-0" />
  <p><span className="font-semibold">Error:</span> {error}</p>
</div>
```

The same applies to transaction status (pending / confirmed / failed): pair colour with a label.

### Motion

Several components use `transition` (`AssetCard.tsx:12`, `Navbar.tsx:17`, `AdminPanel.tsx:38`).
These are short and low-risk, but any new animation that moves, scales or auto-plays must respect:

```tsx
<div className="transition motion-reduce:transition-none motion-reduce:transform-none">
```

---

## 10. Component expectations

Every component in `src/components/` is expected to meet the following. New components must meet
them at review time; existing components are listed with what they still owe.

### Universal rules for any new component

1. **Semantic first.** Reach for `<button>`, `<a>`, `<ul>`, `<table>`, `<label>`, `<form>` before
   any `role`. No ARIA is better than bad ARIA.
2. **Accessible name.** Every interactive element has one, and it starts with the visible label.
3. **Keyboard complete.** Reachable, operable, escapable, with a visible focus ring.
4. **State exposed.** Toggles use `aria-expanded`, `aria-pressed` or `aria-checked`; busy controls
   use `aria-busy`; current page uses `aria-current`.
5. **Ids are unique.** Any component that can render more than once derives ids from `useId()`.
6. **Icons declared.** Decorative → `aria-hidden="true"`; meaningful → labelled.
7. **No fixed-height text containers.** Text must reflow at 200% zoom without clipping.
8. **Callbacks pass the event.** Components that open overlays must give the parent access to the
   trigger element so focus can be restored (see [§4](#4-modals-and-dialogs)).

### Per-component contract

| Component | Must provide | Still missing today |
| --- | --- | --- |
| `Navbar.tsx` | Named `<nav>`, `aria-current` on the active link, mobile-reachable links, `aria-hidden` on `<Shield />`, action-describing name on the wallet button, announced connect/disconnect | All of them |
| `AssetCard.tsx` | Heading at the correct level, disambiguated `Transfer` button name, non-interactive wrapper, no colour-only ticker meaning | Heading level (`h3` under `h1`), button name (`AssetCard.tsx:26-31`) |
| `PortfolioList.tsx` | List semantics + accessible name on the grid, focus restore after modal close, announced loading/empty states | All of them (`PortfolioList.tsx:17-27, 29-34`) |
| `TransferModal.tsx` | `role="dialog"` + `aria-modal` + `aria-labelledby`, focus trap, initial focus, <kbd>Esc</kbd>, focus restore, associated labels, per-field errors, `role="alert"`, `aria-busy`, in-page success | All of them |
| `AdminPanel.tsx` | Associated labels, real `<form>`, explicit button `type`, contrast-safe button colours, announced results instead of `alert()` | All of them |
| `_app.tsx` | Skip link, `<main id="main-content">` | Skip link (`_app.tsx:6-13`) |
| Pages | One `<h1>`, unique `<title>`, announced state transitions | `h1` on gate screens (`admin.tsx:12`, `portfolio.tsx:11`) |

---

## 11. How to test

Run these before every UI PR. No install step is required for the first four.

### Keyboard pass (2 min)

1. Load the page, press <kbd>Tab</kbd> from the address bar.
2. Confirm the skip link appears first, then every control in visual order.
3. Confirm you can *see* where focus is at every stop.
4. Open the transfer modal with <kbd>Enter</kbd>. Confirm focus moves inside, <kbd>Tab</kbd> cycles
   within it, <kbd>Esc</kbd> closes it, and focus returns to the card's Transfer button.
5. Confirm <kbd>Enter</kbd> in a text field submits the form.

### Zoom / reflow pass (1 min)

Set the browser to 200% zoom, or DevTools responsive mode at 320×640. Confirm nothing is clipped,
no horizontal scrolling of the page body, and the Portfolio/Admin links are still reachable.

### Screen reader pass (5 min)

Use one of: **NVDA** (Windows, free), **VoiceOver** (macOS, <kbd>Cmd</kbd>+<kbd>F5</kbd>), or
**Narrator** (Windows, <kbd>Ctrl</kbd>+<kbd>Win</kbd>+<kbd>Enter</kbd>).

- List the headings — is the outline sensible?
- List the buttons and links — is every name unique and meaningful?
- Tab into each form field — is the label read?
- Trigger a validation error — is it announced?
- Run a transfer — are "checking compliance", "awaiting signature" and the result all announced?

### Automated pass

Automated tools catch roughly a third of issues. They are necessary, not sufficient.

- Browser extension: [axe DevTools](https://www.deque.com/axe/devtools/) or Lighthouse's
  Accessibility audit (built into Chrome DevTools).
- Contrast: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/).

If the project later adds linting or tests, `eslint-plugin-jsx-a11y` and `jest-axe` are the
conventional choices for a Next.js codebase; proposing them is a good standalone contribution.

---

## 12. PR checklist

Copy into your PR description and tick what applies to your change.

```markdown
### Accessibility
- [ ] All new interactive elements are reachable and operable by keyboard
- [ ] Focus is visible at every stop; no `outline-none` without a replacement ring
- [ ] Every input has an associated `<label>` (`htmlFor` ↔ `id`)
- [ ] Errors identify the field, are linked via `aria-describedby`, and are announced
- [ ] New overlays have `role="dialog"`, `aria-modal`, a focus trap, Esc, and focus restore
- [ ] Async results (compliance, signing, tx status) are announced via a live region
- [ ] Icon-only controls have an accessible name; decorative icons are `aria-hidden`
- [ ] Text contrast meets 4.5:1 (3:1 for large text and UI boundaries)
- [ ] Nothing is conveyed by colour alone
- [ ] Layout works at 320px width and 200% zoom
- [ ] Verified with a keyboard pass and a screen reader pass (see docs/accessibility-checklist.md §11)
```

---

## References

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide — patterns](https://www.w3.org/WAI/ARIA/apg/patterns/)
  ([Modal Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/),
  [Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/),
  [Table](https://www.w3.org/WAI/ARIA/apg/patterns/table/))
- [MDN — ARIA live regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions)
- [WebAIM — Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [Next.js — Accessibility](https://nextjs.org/docs/architecture/accessibility)
- [The A11Y Project Checklist](https://www.a11yproject.com/checklist/)
