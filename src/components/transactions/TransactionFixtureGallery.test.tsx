import { render, screen } from '@testing-library/react';
import TransactionFixtureGallery from './TransactionFixtureGallery';

describe('TransactionFixtureGallery', () => {
  it('renders the review, progress, and receipt states for contributors', () => {
    render(<TransactionFixtureGallery />);

    expect(
      screen.getByRole('heading', { name: /component fixture gallery/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/review transfer before signing/i)).toBeInTheDocument();
    expect(screen.getByText(/review whitelist update/i)).toBeInTheDocument();
    expect(screen.getByText(/waiting for signature/i)).toBeInTheDocument();
    // expect(screen.getByText(/submitting to the network/i)).toBeInTheDocument();
    expect(screen.getAllByText(/submitting to the network/i),).toHaveLength(2);
    expect(screen.getByText(/transaction confirmed/i)).toBeInTheDocument();
    expect(screen.getByText(/transaction failed/i)).toBeInTheDocument();
    expect(screen.getByText(/transaction status unknown/i)).toBeInTheDocument();
  });
});
