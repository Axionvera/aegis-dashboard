import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ConfigErrorScreen from './ConfigErrorScreen';
import type { ConfigValidationResult } from '@/config/validate';

const resultWithErrorsAndWarnings: ConfigValidationResult = {
  valid: false,
  issues: [
    { field: 'NEXT_PUBLIC_RPC_URL', level: 'error', message: 'RPC URL is not set.' },
    {
      field: 'NEXT_PUBLIC_NETWORK_PASSPHRASE',
      level: 'warning',
      message: 'Passphrase is not one of the known Stellar PUBLIC/TESTNET passphrases.',
    },
  ],
};

const resultErrorsOnly: ConfigValidationResult = {
  valid: false,
  issues: [
    {
      field: 'NEXT_PUBLIC_AEGIS_CONTRACT_ID',
      level: 'error',
      message: 'Contract ID is not a valid Soroban contract ID (expected 56 characters, starting with "C").',
    },
  ],
};

describe('ConfigErrorScreen', () => {
  it('renders the heading', () => {
    render(<ConfigErrorScreen result={resultWithErrorsAndWarnings} />);
    expect(screen.getByText('Dashboard configuration is invalid')).toBeInTheDocument();
  });

  it('lists error-level issues under an Errors heading', () => {
    render(<ConfigErrorScreen result={resultWithErrorsAndWarnings} />);
    expect(screen.getByText('Errors')).toBeInTheDocument();
    expect(screen.getByText('NEXT_PUBLIC_RPC_URL')).toBeInTheDocument();
    expect(screen.getByText(/RPC URL is not set\./)).toBeInTheDocument();
  });

  it('lists warning-level issues under a Warnings heading', () => {
    render(<ConfigErrorScreen result={resultWithErrorsAndWarnings} />);
    expect(screen.getByText('Warnings')).toBeInTheDocument();
    expect(screen.getByText('NEXT_PUBLIC_NETWORK_PASSPHRASE')).toBeInTheDocument();
  });

  it('omits the Warnings heading when there are no warnings', () => {
    render(<ConfigErrorScreen result={resultErrorsOnly} />);
    expect(screen.queryByText('Warnings')).not.toBeInTheDocument();
  });

  it('points to the docs and mock mode as a way forward', () => {
    render(<ConfigErrorScreen result={resultErrorsOnly} />);
    expect(screen.getByText(/docs\/config-validation\.md/)).toBeInTheDocument();
    expect(screen.getByText(/NEXT_PUBLIC_MOCK_MODE/)).toBeInTheDocument();
  });
});