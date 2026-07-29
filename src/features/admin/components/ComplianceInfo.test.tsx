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
    expect(text).toContain('Revoked');
    expect(text).toContain('Pending');
    expect(text).toContain('Blocked');
    expect(text).toContain('Unknown');
    expect(text).toContain('Unavailable');

    // Each status has an explanation
    expect(text).toContain('marked approved in the protocol compliance registry');
    expect(text).toContain('has been revoked');
    expect(text).toContain('under protocol compliance review');
    expect(text).toContain('blocked from protocol actions');
    expect(text).toContain('No clear protocol compliance record');
    expect(text).toContain('could not be retrieved right now');
  });
});
