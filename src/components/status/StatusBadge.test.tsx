import React from 'react';
import { render } from '@testing-library/react';
import StatusBadge from './StatusBadge';
import { statusForComplianceState, statusForTransaction } from '@/lib/status';

describe('StatusBadge', () => {
  it('renders the label from the given StatusInfo', () => {
    const { getByText } = render(<StatusBadge status={statusForComplianceState('compliant')} />);
    expect(getByText('Compliant')).toBeInTheDocument();
  });

  it('renders the detail as a title attribute for a tooltip', () => {
    const status = statusForComplianceState('restricted');
    const { getByText } = render(<StatusBadge status={status} />);
    expect(getByText('Restricted').closest('span')).toHaveAttribute('title', status.detail);
  });

  it('applies pill shape classes when variant="pill"', () => {
    const { getByText } = render(
      <StatusBadge status={statusForTransaction('success')} variant="pill" />,
    );
    expect(getByText('Success').closest('span')?.className).toContain('rounded-full');
  });

  it('applies outline shape classes by default', () => {
    const { getByText } = render(<StatusBadge status={statusForTransaction('failed')} />);
    expect(getByText('Failed').closest('span')?.className).toContain('border');
  });

  it('hides the icon when showIcon is false', () => {
    const { container } = render(
      <StatusBadge status={statusForTransaction('pending')} showIcon={false} />,
    );
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  it('shows an icon by default', () => {
    const { container } = render(<StatusBadge status={statusForTransaction('pending')} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
