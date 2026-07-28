# Empty State Components

## Overview

The `EmptyState` component provides a consistent, reusable way to display empty states across the dashboard. It supports two main variants:

- **`no-data`**: Used when no data exists yet (neutral/informative)
- **`unavailable`**: Used when data exists but is temporarily unavailable (warning/error)

## Component API

### Props

```typescript
interface EmptyStateProps {
  /**
   * Icon component to display in the empty state
   */
  icon?: LucideIcon;
  /**
   * Title of the empty state
   */
  title: string;
  /**
   * Description explaining the empty state
   */
  description: string;
  /**
   * Optional actions the user can take
   */
  actions?: EmptyStateAction[];
  /**
   * Optional documentation link
   */
  docsLink?: {
    label: string;
    href: string;
  };
  /**
   * Variant of empty state
   * - 'no-data': No data exists yet (neutral/informative)
   * - 'unavailable': Data exists but is temporarily unavailable (warning/error)
   */
  variant?: 'no-data' | 'unavailable';
  /**
   * Optional custom className
   */
  className?: string;
}

interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  href?: string;
}
```

## Usage Examples

### Basic No-Data State

```tsx
import { EmptyState } from '@/components/states';
import { PackageOpen } from 'lucide-react';

<EmptyState
  icon={PackageOpen}
  title="No holdings yet"
  description="This address does not currently hold any Aegis RWA tokens."
  variant="no-data"
/>
```

### No-Data State with Actions

```tsx
import { EmptyState } from '@/components/states';
import { Activity } from 'lucide-react';

<EmptyState
  icon={Activity}
  title="No transactions found"
  description="No transactions match the selected filters."
  variant="no-data"
  actions={[
    {
      label: 'Clear filters',
      onClick: () => setFilters(defaultFilters),
      variant: 'secondary',
    },
  ]}
/>
```

### Unavailable State with Retry

```tsx
import { EmptyState } from '@/components/states';
import { AlertTriangle } from 'lucide-react';

<EmptyState
  icon={AlertTriangle}
  title="Service unavailable"
  description="Unable to fetch data at this time."
  variant="unavailable"
  actions={[
    {
      label: 'Retry',
      onClick: refetch,
      variant: 'primary',
    },
  ]}
/>
```

### With Documentation Link

```tsx
import { EmptyState } from '@/components/states';

<EmptyState
  title="No compliance records"
  description="No compliance records found for this entity."
  variant="no-data"
  docsLink={{
    label: 'Learn about KYC bulk import',
    href: '/docs/kyc-bulk-import',
  }}
/>
```

## Variants

### No-Data Variant

Use the `no-data` variant when:
- A list or table has no items to display
- Data has never been created or added
- The state is expected and not an error

**Visual style:**
- Slate/gray color scheme
- Neutral border and background
- Informative tone

**Example use cases:**
- Empty portfolio with no assets
- No transactions in history
- No compliance records
- No investors added

### Unavailable Variant

Use the `unavailable` variant when:
- Data should exist but cannot be fetched
- A service or API is temporarily down
- There's a network or connection issue
- Metadata is temporarily unavailable

**Visual style:**
- Amber/yellow color scheme
- Warning border and background
- Action-oriented tone

**Example use cases:**
- Portfolio data fetch failed
- Compliance registry unavailable
- Transaction history fetch error
- Diagnostic information unavailable

## Fixtures

Pre-configured fixtures are available in `src/components/states/fixtures.ts` for common dashboard scenarios:

```typescript
import { emptyStateFixtures } from '@/components/states/fixtures';

// Portfolio no-data
emptyStateFixtures.portfolioNoData

// Portfolio unavailable
emptyStateFixtures.portfolioUnavailable

// Transactions no-data
emptyStateFixtures.transactionsNoData

// Compliance no-data
emptyStateFixtures.complianceNoData

// Investors no-data
emptyStateFixtures.investorsNoData

// And more...
```

## Integration Examples

### Portfolio List

The portfolio list uses `EmptyState` for both no-data and error states:

```tsx
if (assets.length === 0) {
  return (
    <EmptyState
      title="No holdings yet"
      description="This address does not currently hold any Aegis RWA tokens."
      variant="no-data"
      docsLink={{
        label: 'Learn about RWA tokens',
        href: '/docs/rwa-tokens',
      }}
    />
  );
}

if (status === 'error') {
  return (
    <EmptyState
      title="Portfolio unavailable"
      description={error ?? 'Unable to load your portfolio right now.'}
      variant="unavailable"
      actions={[
        {
          label: 'Retry',
          onClick: refetch,
          variant: 'primary',
        },
      ]}
    />
  );
}
```

### Transaction History

Transaction history uses `EmptyState` when no records match filters:

```tsx
{filteredRecords.length === 0 && (
  <EmptyState
    icon={Activity}
    title="No transactions found"
    description="No transactions match the selected filters."
    variant="no-data"
    actions={[
      {
        label: 'Clear filters',
        onClick: () => setFilters(defaultTransactionHistoryFilters),
        variant: 'secondary',
      },
    ]}
  />
)}
```

### Bulk Compliance Review

The compliance review table uses `EmptyState` when no subjects match filters:

```tsx
{visible.length === 0 && (
  <EmptyState
    icon={FileText}
    title="No compliance records"
    description="No compliance records found for this entity."
    variant="no-data"
    actions={[
      {
        label: 'Clear filter',
        onClick: () => setQuery(''),
        variant: 'secondary',
      },
    ]}
    docsLink={{
      label: 'Learn about KYC bulk import',
      href: '/docs/kyc-bulk-import',
    }}
  />
)}
```

## Best Practices

1. **Choose the right variant**: Use `no-data` for expected empty states and `unavailable` for error/unavailable states
2. **Provide clear next actions**: Always include relevant actions when possible (retry, clear filters, add item, etc.)
3. **Link to documentation**: When appropriate, include a docs link to help users understand the context
4. **Use descriptive icons**: Choose icons that visually represent the state (e.g., `PackageOpen` for empty portfolio, `AlertTriangle` for errors)
5. **Keep descriptions concise**: Provide enough context without overwhelming the user
6. **Maintain consistency**: Use the fixtures when possible to ensure consistent messaging across the dashboard

## Testing

The component includes comprehensive tests in `src/components/states/EmptyState.test.tsx`:

```bash
npm test -- EmptyState.test.tsx
```

Tests cover:
- Rendering with and without icons
- Both variants (no-data and unavailable)
- Action buttons and click handlers
- Documentation links
- Custom className application

## Design Guidelines

- **Spacing**: Uses `py-16` for vertical padding to create breathing room
- **Border**: Dashed border to visually distinguish from content cards
- **Typography**: Title uses `text-lg font-semibold`, description uses standard text
- **Actions**: Primary actions use brand color, secondary actions use neutral colors
- **Responsive**: Actions stack vertically on mobile, horizontally on larger screens
- **Accessibility**: Documentation links open in new tab with proper rel attributes
