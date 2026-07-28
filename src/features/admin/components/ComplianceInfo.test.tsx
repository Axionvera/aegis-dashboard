import React from 'react';
import { render } from '@testing-library/react';
import ComplianceInfo from './ComplianceInfo';

// Minimal smoke test — verifies component renders all six statuses
// without crashing and each status label appears in the output.
describe('ComplianceInfo', () => {
  it('renders all six compliance statuses', () => {
    const { container } = render(<ComplianceInfo />);
    const text = container.textContent || '';

    expect(text).toContain('Approved');
    expect(text).toContain('Not Approved');
    expect(text).toContain('Pending');
    expect(text).toContain('Blocked');
    expect(text).toContain('Unknown');
    expect(text).toContain('Unavailable');

    // Each status has an explanation
    expect(text).toContain('fully approved');
    expect(text).toContain('denied approval');
    expect(text).toContain('under compliance review');
    expect(text).toContain('regulatory restrictions');
    expect(text).toContain('not yet determined');
    expect(text).toContain('temporarily unavailable');
  });
});
