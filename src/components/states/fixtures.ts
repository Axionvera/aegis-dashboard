import { PackageOpen, AlertTriangle, FileText, Wallet, Activity, Database } from 'lucide-react';
import type { EmptyStateAction } from './EmptyState';

/**
 * Fixture data for empty-state components across different dashboard areas.
 * These can be used for testing, storybook examples, or as defaults in feature components.
 */

export const emptyStateFixtures = {
  // Portfolio/Assets - No holdings
  portfolioNoData: {
    icon: PackageOpen,
    title: 'No holdings yet',
    description: 'This address does not currently hold any Aegis RWA tokens. Once an issuer mints assets to your wallet, they will appear here.',
    variant: 'no-data' as const,
    actions: [] as EmptyStateAction[],
    docsLink: {
      label: 'Learn about RWA tokens',
      href: '/docs/rwa-tokens',
    },
  },

  // Portfolio/Assets - Service unavailable
  portfolioUnavailable: {
    icon: AlertTriangle,
    title: 'Portfolio temporarily unavailable',
    description: 'Asset metadata is temporarily unavailable from the compliance registry. Your recorded balance is still shown below.',
    variant: 'unavailable' as const,
    actions: [
      {
        label: 'Retry',
        onClick: () => console.log('Retry clicked'),
        variant: 'primary',
      },
    ] as EmptyStateAction[],
    docsLink: {
      label: 'View compliance registry status',
      href: '/docs/compliance-registry',
    },
  },

  // Transactions - No transactions
  transactionsNoData: {
    icon: Activity,
    title: 'No transactions found',
    description: 'No transactions match the selected filters. Try adjusting your filter criteria or check back later.',
    variant: 'no-data' as const,
    actions: [
      {
        label: 'Clear filters',
        onClick: () => console.log('Clear filters clicked'),
        variant: 'secondary',
      },
    ] as EmptyStateAction[],
  },

  // Transactions - Service unavailable
  transactionsUnavailable: {
    icon: AlertTriangle,
    title: 'Transaction history unavailable',
    description: 'Unable to fetch transaction history at this time. Please check your connection and try again.',
    variant: 'unavailable' as const,
    actions: [
      {
        label: 'Retry',
        onClick: () => console.log('Retry clicked'),
        variant: 'primary',
      },
    ] as EmptyStateAction[],
  },

  // Compliance - No compliance records
  complianceNoData: {
    icon: FileText,
    title: 'No compliance records',
    description: 'No compliance records found for this entity. Compliance data will appear here once available.',
    variant: 'no-data' as const,
    actions: [
      {
        label: 'Import KYC data',
        onClick: () => console.log('Import KYC clicked'),
        variant: 'primary',
      },
    ] as EmptyStateAction[],
    docsLink: {
      label: 'Learn about KYC bulk import',
      href: '/docs/kyc-bulk-import',
    },
  },

  // Compliance - Service unavailable
  complianceUnavailable: {
    icon: AlertTriangle,
    title: 'Compliance service unavailable',
    description: 'The compliance registry is temporarily unavailable. Please try again later.',
    variant: 'unavailable' as const,
    actions: [
      {
        label: 'Retry',
        onClick: () => console.log('Retry clicked'),
        variant: 'primary',
      },
    ] as EmptyStateAction[],
  },

  // Investors - No investors
  investorsNoData: {
    icon: Wallet,
    title: 'No investors found',
    description: 'No investors have been added yet. Add investors to manage their eligibility and compliance.',
    variant: 'no-data' as const,
    actions: [
      {
        label: 'Add investor',
        onClick: () => console.log('Add investor clicked'),
        variant: 'primary',
      },
    ] as EmptyStateAction[],
    docsLink: {
      label: 'Learn about investor management',
      href: '/docs/investor-management',
    },
  },

  // Diagnostics - No diagnostic data
  diagnosticsNoData: {
    icon: Database,
    title: 'No diagnostic data',
    description: 'Diagnostic information is not available. Ensure you are connected to the network.',
    variant: 'no-data' as const,
    actions: [
      {
        label: 'Connect wallet',
        onClick: () => console.log('Connect wallet clicked'),
        variant: 'primary',
      },
    ] as EmptyStateAction[],
  },

  // Diagnostics - Service unavailable
  diagnosticsUnavailable: {
    icon: AlertTriangle,
    title: 'Diagnostics unavailable',
    description: 'Unable to fetch diagnostic information. The service may be temporarily down.',
    variant: 'unavailable' as const,
    actions: [
      {
        label: 'Retry',
        onClick: () => console.log('Retry clicked'),
        variant: 'primary',
      },
    ] as EmptyStateAction[],
  },
};
