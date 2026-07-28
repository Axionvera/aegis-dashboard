# Aegis Dashboard — Contributor Design Guidelines

This document defines the visual and structural standards for all frontend contributions to the Aegis RWA Dashboard. Follow these guidelines to maintain a consistent, accessible, and maintainable UI across the project.

---

## Table of Contents

1. [Tailwind CSS Usage Rules](#tailwind-css-usage-rules)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing and Layout](#spacing-and-layout)
5. [Component Structure](#component-structure)
6. [Cards](#cards)
7. [Forms](#forms)
8. [Tables](#tables)
9. [Buttons](#buttons)
10. [Modals](#modals)
11. [Status States](#status-states)
12. [Responsive Design](#responsive-design)
13. [Accessibility](#accessibility)
14. [Component Reuse Expectations](#component-reuse-expectations)
15. [Review Checklist](#review-checklist)

---

## Tailwind CSS Usage Rules

### General Principles

- Use Tailwind utility classes exclusively. Do not write custom CSS in `globals.css` unless a utility cannot achieve the desired result.
- Never use inline `style` attributes.
- Use the project's extended theme tokens (`aegis-dark`, `aegis-brand`, `aegis-accent`) instead of raw color values.
- Group related utilities logically: layout → spacing → sizing → typography → color → effects.

### Class Ordering Convention

Follow this order when writing class strings:

```
position → display → flex/grid → width/height → margin → padding → typography → color/bg → border → shadow → transition → state variants
```

Example:

```tsx
className="relative flex items-center w-full p-4 text-sm text-slate-700 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition"
```

### What to Avoid

- `@apply` in component files — keep styles co-located with markup via utility classes.
- Arbitrary values (`w-[347px]`) — use Tailwind's spacing scale or extend the config.
- `!important` overrides — restructure specificity instead.
- Color literals (`bg-[#3b82f6]`) — use semantic tokens from `tailwind.config.js`.

---

## Color System

All colors are defined in `tailwind.config.js` under `theme.extend.colors.aegis`:

| Token | Value | Usage |
|-------|-------|-------|
| `aegis-dark` | `#0f172a` | Primary dark backgrounds, strong text |
| `aegis-brand` | `#3b82f6` | Primary actions, links, interactive highlights |
| `aegis-accent` | `#10b981` | Success states, secondary actions (e.g., Whitelist) |

### Neutral Palette

Use the `slate` scale for all neutral surfaces and text:

- Backgrounds: `bg-slate-50` (page), `bg-white` (cards/panels)
- Primary text: `text-slate-900`
- Secondary text: `text-slate-600`
- Muted text: `text-slate-500`
- Borders: `border-slate-200`, `border-slate-300` (inputs)

### Semantic Colors

- Error: `bg-red-50` background, `text-red-600` text
- Warning: `bg-amber-50` background, `text-amber-700` text
- Success: `bg-emerald-50` background, `text-aegis-accent` text
- Info: `bg-blue-50` background, `text-aegis-brand` text

---

## Typography

- Use Tailwind's font-size utilities. Do not import custom fonts unless discussed in an issue.
- Headings hierarchy:
  - Page title: `text-3xl font-bold text-slate-900`
  - Section title: `text-xl font-bold`
  - Card title: `text-lg font-bold text-slate-800`
  - Label: `text-sm font-medium text-slate-700`
- Body text: `text-sm` or `text-base` depending on context.
- Monospace (addresses, hashes): `font-mono text-xs`

---

## Spacing and Layout

### Page Layout

The application shell is defined in `_app.tsx`:

```tsx
<main className="flex-grow p-6 md:p-12 max-w-7xl mx-auto w-full">
```

- Page padding: `p-6` on mobile, `md:p-12` on desktop.
- Maximum content width: `max-w-7xl` (80rem).
- All pages are vertically stacked within this container.

### Spacing Scale

Use consistent spacing between sections and elements:

| Context | Class |
|---------|-------|
| Between page title and content | `mb-8` |
| Between form fields | `space-y-4` |
| Between cards in a grid | `gap-6` |
| Inside cards (padding) | `p-6` |
| Between button groups | `space-x-3` or `space-x-4` |

---

## Component Structure

### File Organization

```
src/components/
├── AdminPanel.tsx      # Feature-specific panel
├── AssetCard.tsx       # Reusable card component
├── Navbar.tsx          # Global navigation
├── PortfolioList.tsx   # List composition component
└── TransferModal.tsx   # Modal dialog
```

### Component Conventions

- One component per file. File name matches the default export in PascalCase.
- Use TypeScript interfaces for props. Define them above the component in the same file.
- Keep state local unless multiple components need it. For global state (wallet), use Zustand stores in `src/hooks/`.
- Hooks go in `src/hooks/` and follow the `useX` naming convention.
- Utility functions go in `src/utils/`.

### Props Interface Pattern

```tsx
interface AssetCardProps {
  name: string;
  ticker: string;
  balance: number;
  onTransferClick: () => void;
}

export default function AssetCard({ name, ticker, balance, onTransferClick }: AssetCardProps) {
  // ...
}
```

---

## Cards

Cards are the primary container for grouped content (assets, admin panels, data summaries).

### Standard Card Shell

```tsx
<div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition">
  {/* Card content */}
</div>
```

### Rules

- Background: `bg-white`
- Padding: `p-6`
- Border radius: `rounded-xl`
- Border: `border border-slate-200`
- Shadow: `shadow-sm` at rest, `shadow-md` on hover (only if the card is interactive)
- Do not nest cards inside cards.

---

## Forms

### Input Fields

All text inputs follow this pattern:

```tsx
<div>
  <label className="block text-sm font-medium text-slate-700 mb-1">
    Field Label
  </label>
  <input
    type="text"
    className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-aegis-brand outline-none"
    placeholder="Placeholder..."
  />
</div>
```

### Rules

- Labels are always above inputs (`block` display, `mb-1` gap).
- Inputs are always full-width (`w-full`).
- Focus state: `focus:ring-2 focus:ring-aegis-brand outline-none`.
- Group fields with `space-y-4`.
- Never use browser-default focus outlines — always apply `outline-none` with a ring replacement.

### Validation Errors

Display errors inline above the form or below the field:

```tsx
<div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
  Error message here
</div>
```

---

## Tables

When displaying tabular data (asset lists, transaction history, admin logs):

### Structure

```tsx
<div className="overflow-x-auto rounded-xl border border-slate-200">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
      <tr>
        <th className="px-4 py-3">Column</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100">
      <tr className="hover:bg-slate-50 transition">
        <td className="px-4 py-3 text-slate-800">Data</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Rules

- Wrap tables in `overflow-x-auto` for mobile scroll.
- Use `rounded-xl border border-slate-200` on the wrapper.
- Header: `bg-slate-50`, `text-slate-600`, `font-medium`.
- Row dividers: `divide-y divide-slate-100`.
- Row hover: `hover:bg-slate-50 transition`.
- Cell padding: `px-4 py-3`.
- Align numbers and amounts to the right with `text-right`.

---

## Buttons

### Variants

| Variant | Classes | Usage |
|---------|---------|-------|
| Primary | `bg-aegis-brand hover:bg-blue-600 text-white` | Main CTAs (Connect Wallet, Confirm Transfer) |
| Dark | `bg-aegis-dark hover:bg-slate-800 text-white` | Strong secondary actions (Mint Asset) |
| Success | `bg-aegis-accent hover:bg-emerald-600 text-white` | Positive actions (Whitelist User) |
| Ghost | `bg-slate-100 hover:bg-slate-200 text-slate-700` | Cancel, dismiss, non-critical actions |
| Outline | `bg-white border border-slate-300 hover:bg-slate-50 text-slate-700` | Tertiary actions (View GitHub) |

### Common Properties

All buttons share:

```
font-medium py-2 rounded transition disabled:opacity-50
```

- Use `rounded-lg` for large standalone buttons, `rounded` or `rounded-md` for inline/grouped buttons.
- Always include `transition` for hover effects.
- Always add `disabled:opacity-50` and pair with the `disabled` attribute when loading.
- Full-width buttons in cards: add `w-full`.
- Button groups: use `flex space-x-3` or `space-x-4`.

---

## Modals

### Structure

```tsx
<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
  <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
    <h2 className="text-xl font-bold mb-4">Modal Title</h2>
    {/* Content */}
    <div className="flex space-x-3">
      <button className="flex-1 ...">Cancel</button>
      <button className="flex-1 ...">Confirm</button>
    </div>
  </div>
</div>
```

### Rules

- Backdrop: `fixed inset-0 bg-black/50 z-50`.
- Panel: `bg-white p-6 rounded-xl shadow-lg w-full max-w-md`.
- Always provide a Cancel/Close action.
- Action buttons go at the bottom in a `flex space-x-3` row with `flex-1` on each.

---

## Status States

Use consistent patterns for loading, empty, error, and success states across all views.

### Loading State

```tsx
<button disabled className="... disabled:opacity-50">
  {isLoading ? 'Processing...' : 'Confirm'}
</button>
```

- Disable interactive elements during async operations.
- Show inline text feedback (`Processing...`, `Connecting...`).
- For content areas, use skeleton placeholders (gray rounded boxes with `animate-pulse`):

```tsx
<div className="bg-slate-200 rounded h-6 w-3/4 animate-pulse" />
```

### Empty State

When no data is available (no assets, no transactions):

```tsx
<div className="text-center py-20">
  <h2 className="text-2xl font-bold text-slate-800">Title</h2>
  <p className="text-slate-500 mt-2">Helpful description or next step.</p>
</div>
```

### Error State

Inline errors within forms or panels:

```tsx
<div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
  Error message
</div>
```

Page-level errors:

```tsx
<div className="text-center py-20">
  <h2 className="text-2xl font-bold text-red-700">Something went wrong</h2>
  <p className="text-slate-500 mt-2">Description of what failed.</p>
  <button className="mt-4 bg-aegis-brand text-white px-4 py-2 rounded-lg">Retry</button>
</div>
```

### Success State

- Use `alert()` only for mocked/dev interactions.
- In production, use a toast or inline confirmation:

```tsx
<div className="bg-emerald-50 text-aegis-accent p-3 rounded mb-4 text-sm font-medium">
  Transaction successful!
</div>
```

---

## Responsive Design

This project follows a mobile-first approach using Tailwind's responsive prefixes.

### Breakpoint Usage

| Prefix | Min-width | Usage |
|--------|-----------|-------|
| (none) | 0px | Mobile base styles |
| `md:` | 768px | Tablet / small desktop |
| `lg:` | 1024px | Desktop |

### Guidelines

- Default layouts stack vertically; add `md:` or `lg:` prefixes for horizontal arrangements.
- Card grids: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`.
- Navigation links: hide with `hidden md:flex` and provide a mobile menu alternative.
- Page padding: `p-6 md:p-12`.
- Never use fixed pixel widths that break on small screens. Use `max-w-*` with `w-full`.

---

## Accessibility

- All form inputs must have an associated `<label>`.
- Interactive elements must be keyboard-accessible (use `<button>` for actions, not `<div onClick>`).
- Provide visible focus indicators — the `focus:ring-2 focus:ring-aegis-brand` pattern handles this.
- Use semantic HTML: `<nav>`, `<main>`, `<h1>`–`<h3>` in correct hierarchy.
- Modals should trap focus and be dismissable with Escape (implement with a `useEffect` keydown listener).
- Color contrast: ensure all text/background combinations meet WCAG 2.1 AA (4.5:1 for normal text).
- Add `aria-label` to icon-only buttons.

---

## Component Reuse Expectations

### Before Creating a New Component

1. Check if an existing component already serves the purpose.
2. If the pattern exists in two or more places, extract it into `src/components/`.
3. If it exists in only one place, keep it inline until reuse is needed.

### When to Create a Shared Component

- The same UI pattern is used in 2+ locations.
- The pattern has props that vary between instances (data, callbacks).
- The component encapsulates a complete interaction (card, modal, form group).

### When NOT to Create a Component

- A one-off layout section that won't be reused.
- A trivial wrapper that just passes props through.
- Over-abstraction that hides simple Tailwind markup behind unnecessary indirection.

### Naming Rules

- Component files: `PascalCase.tsx` (e.g., `AssetCard.tsx`).
- One default export per file matching the filename.
- Props interface: `ComponentNameProps`.
- Hooks: `useX.ts` in `src/hooks/`.
- Utilities: named exports in `src/utils/`.

---

## Review Checklist

Before submitting a PR that includes UI changes, verify:

### Tailwind and Styling
- [ ] No custom CSS added to `globals.css` (unless justified and documented).
- [ ] Uses project color tokens (`aegis-brand`, `aegis-dark`, `aegis-accent`, `slate-*`) — no raw hex values.
- [ ] No arbitrary Tailwind values (`w-[347px]`) — uses the spacing scale or config extension.
- [ ] Class order follows the project convention (layout → spacing → typography → color → effects).

### Component Quality
- [ ] Props are typed with a TypeScript interface.
- [ ] Component is in the correct directory (`components/`, `hooks/`, `utils/`).
- [ ] No duplicated UI patterns — reuses existing components where possible.
- [ ] State is kept as local as possible.

### Layout and Responsiveness
- [ ] Works on mobile (375px), tablet (768px), and desktop (1024px+).
- [ ] Uses `grid` or `flex` with responsive prefixes — no fixed widths.
- [ ] Card grids collapse to single-column on mobile.

### Accessibility
- [ ] All inputs have labels.
- [ ] Buttons use `<button>`, not clickable `<div>` elements.
- [ ] Focus states are visible.
- [ ] Color contrast passes AA standards.

### States
- [ ] Loading states disable buttons and show feedback text.
- [ ] Empty states show a helpful message.
- [ ] Error states are visible and non-destructive (no `console.log`-only errors).

### PR Requirements
- [ ] Screenshot or GIF of the UI change is included in the PR description.
- [ ] Component is mobile-first and responsive (per CONTRIBUTING.md).
- [ ] Branch follows naming convention (`feat/`, `fix/`, or `ui/`).

---

## References

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Next.js Pages Router](https://nextjs.org/docs/pages)
- [Zustand State Management](https://docs.pmnd.rs/zustand)
- [Lucide Icons](https://lucide.dev/icons)
- Project Tailwind config: `tailwind.config.js`
- Architecture overview: `docs/architecture.md`
- Frontend guide: `docs/frontend-guide.md`
- Contributing rules: `CONTRIBUTING.md`
