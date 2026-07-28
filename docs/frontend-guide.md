# Frontend Developer Guide

## Styling Conventions
We utilize **Tailwind CSS** for all styling.
- Avoid writing custom CSS in `globals.css` unless absolutely necessary.
- We have extended the Tailwind config with custom brand colors. Use `bg-aegis-brand`, `text-aegis-dark`, and `text-aegis-accent` to maintain brand consistency.

## Transaction Flows
Any flow that ends in a signed transaction (transfers, minting, compliance updates, admin actions) must reuse the shared components in `src/components/transactions/` instead of building its own review screen, spinner or success alert. See [Transaction Review & Receipt Components](./transaction-components.md).

## Adding a New Page
1. Create a new `.tsx` file in the `src/pages/` directory. Next.js will automatically route it.
2. Ensure you wrap the page content appropriately and import necessary components.