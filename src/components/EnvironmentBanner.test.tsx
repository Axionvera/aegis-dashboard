import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import EnvironmentBanner from './EnvironmentBanner';

const ORIGINAL_ENV = process.env;
const VALID_CONTRACT_ID = 'C' + 'A'.repeat(55);

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
  process.env.NEXT_PUBLIC_MOCK_MODE = 'false';
  process.env.NEXT_PUBLIC_AEGIS_CONTRACT_ID = VALID_CONTRACT_ID;
});

describe('EnvironmentBanner', () => {
  it('renders nothing when mock mode is active', () => {
    process.env.NEXT_PUBLIC_MOCK_MODE = 'true';
    const { container } = render(<EnvironmentBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the testnet label for the TESTNET passphrase', () => {
    process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';
    render(<EnvironmentBanner />);
    expect(screen.getByText('Stellar Testnet (TESTNET)')).toBeInTheDocument();
  });

  it('shows a distinct LIVE MAINNET label for the PUBLIC passphrase', () => {
    process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE = 'Public Global Stellar Network ; September 2015';
    render(<EnvironmentBanner />);
    expect(screen.getByText('LIVE MAINNET')).toBeInTheDocument();
  });

  it('shows a redacted contract id, never the full id', () => {
    process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';
    render(<EnvironmentBanner />);
    expect(screen.queryByText(VALID_CONTRACT_ID)).not.toBeInTheDocument();
    expect(screen.getByText(`${VALID_CONTRACT_ID.slice(0, 4)}...${VALID_CONTRACT_ID.slice(-4)}`)).toBeInTheDocument();
  });
});