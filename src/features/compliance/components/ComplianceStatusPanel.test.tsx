import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ComplianceStatusPanel from '@/features/compliance/components/ComplianceStatusPanel';
import { COMPLIANCE_DISCLAIMER } from '@/lib/complianceReview';

const mockUseComplianceStatus = vi.fn();

vi.mock('@/features/compliance/hooks/useComplianceStatus', () => ({
  useComplianceStatus: (...args: unknown[]) => mockUseComplianceStatus(...args),
}));

describe('ComplianceStatusPanel', () => {
  beforeEach(() => {
    mockUseComplianceStatus.mockReset();
  });

  it('prompts to connect when no address is provided', () => {
    mockUseComplianceStatus.mockReturnValue({
      status: 'idle',
      record: null,
      error: null,
      refetch: vi.fn(),
    });

    render(<ComplianceStatusPanel address={null} />);

    expect(screen.getByText(/connect a wallet/i)).toBeInTheDocument();
    expect(screen.getByText(COMPLIANCE_DISCLAIMER)).toBeInTheDocument();
  });

  it('renders approved status with safe disclaimer copy', () => {
    mockUseComplianceStatus.mockReturnValue({
      status: 'ready',
      record: {
        address: 'GCFXCOMPAPPROVED0000000000000000000000000000000000000',
        state: 'approved',
        label: 'Approved',
        explanation:
          'This address is currently marked approved in the protocol compliance registry for dashboard actions.',
        reasonCode: 'REGISTRY_APPROVED',
        source: 'sdk',
      },
      error: null,
      refetch: vi.fn(),
    });

    render(<ComplianceStatusPanel address="GCFXCOMPAPPROVED0000000000000000000000000000000000000" />);

    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByText(/protocol compliance registry/i)).toBeInTheDocument();
    expect(screen.getByText(COMPLIANCE_DISCLAIMER)).toBeInTheDocument();
    expect(screen.getByText(/does not perform real-world KYC/i)).toBeInTheDocument();
  });

  it('renders revoked and unavailable labels distinctly', () => {
    mockUseComplianceStatus.mockReturnValue({
      status: 'ready',
      record: {
        address: 'GCFXCOMPREVOKED000000000000000000000000000000000000000',
        state: 'revoked',
        label: 'Revoked',
        explanation: 'Prior protocol approval for this address has been revoked.',
        source: 'fixture',
      },
      error: null,
      refetch: vi.fn(),
    });

    const { rerender } = render(
      <ComplianceStatusPanel address="GCFXCOMPREVOKED000000000000000000000000000000000000000" />,
    );
    expect(screen.getByText('Revoked')).toBeInTheDocument();

    mockUseComplianceStatus.mockReturnValue({
      status: 'ready',
      record: {
        address: 'GCFXCOMPUNAVAILABLE000000000000000000000000000000000',
        state: 'unavailable',
        label: 'Unavailable',
        explanation: 'Compliance data could not be retrieved.',
        source: 'fallback',
      },
      error: null,
      refetch: vi.fn(),
    });

    rerender(
      <ComplianceStatusPanel address="GCFXCOMPUNAVAILABLE000000000000000000000000000000000" />,
    );
    expect(screen.getByText('Unavailable')).toBeInTheDocument();
  });
});
