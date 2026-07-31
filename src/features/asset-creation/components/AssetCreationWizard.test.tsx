import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AssetCreationWizard from './AssetCreationWizard';

function fillValidForm() {
  fireEvent.change(screen.getByLabelText(/asset name/i), {
    target: { value: 'Frankfurt Logistics Fund' },
  });
  fireEvent.change(screen.getByLabelText(/ticker/i), { target: { value: 'FR-LOG2' } });
  fireEvent.change(screen.getByLabelText(/initial requested supply/i), {
    target: { value: '250000' },
  });
}

describe('AssetCreationWizard', () => {
  it('renders the form step by default', () => {
    render(<AssetCreationWizard onCreate={vi.fn()} />);
    expect(screen.getByText('New RWA asset request')).toBeInTheDocument();
    expect(screen.getByLabelText(/asset name/i)).toBeInTheDocument();
  });

  it('blocks review with an inline error when fields are invalid', () => {
    render(<AssetCreationWizard onCreate={vi.fn()} />);
    fireEvent.click(screen.getByText('Review request'));
    expect(screen.getByRole('alert')).toHaveTextContent(/fill in every field/i);
    expect(screen.queryByText('Review issuance request')).not.toBeInTheDocument();
  });

  it('rejects a duplicate ticker before reaching review', () => {
    render(
      <AssetCreationWizard onCreate={vi.fn()} existingTickers={['FR-LOG2']} />,
    );
    fillValidForm();
    fireEvent.click(screen.getByText('Review request'));
    expect(screen.getByRole('alert')).toHaveTextContent(/already exists/i);
  });

  it('advances to review with valid input, then submits and calls onCreate', () => {
    const onCreate = vi.fn();
    render(<AssetCreationWizard onCreate={onCreate} requestedBy="GALICE...TEST" />);

    fillValidForm();
    fireEvent.click(screen.getByText('Review request'));

    expect(screen.getByText('Review issuance request')).toBeInTheDocument();
    expect(screen.getByText('FR-LOG2')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Submit for review'));

    expect(onCreate).toHaveBeenCalledTimes(1);
    const created = onCreate.mock.calls[0][0];
    expect(created).toMatchObject({
      assetName: 'Frankfurt Logistics Fund',
      ticker: 'FR-LOG2',
      amount: 250000,
      status: 'pending',
      requestedBy: 'GALICE...TEST',
    });

    expect(screen.getByText('Request submitted')).toBeInTheDocument();
  });

  it('shows review details including issuer, network, and warnings', () => {
    render(<AssetCreationWizard onCreate={vi.fn()} requestedBy="ABCDEF1234567890" />);

    fireEvent.change(screen.getByLabelText(/asset name/i), {
      target: { value: 'Frankfurt Logistics Fund' },
    });
    fireEvent.change(screen.getByLabelText(/ticker/i), { target: { value: 'FR-LOG2' } });
    fireEvent.change(screen.getByLabelText(/initial requested supply/i), {
      target: { value: '600000000' },
    });

    fireEvent.click(screen.getByText('Review request'));

    expect(screen.getByText('ABCDEF…7890')).toBeInTheDocument();
    expect(screen.getByText(/Network/)).toBeInTheDocument();
    expect(screen.getByText(/Validation summary/)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(/exceeds 50% of the soft cap/i);
  });

  it('lets the user go back from review to fix the form', () => {
    render(<AssetCreationWizard onCreate={vi.fn()} />);
    fillValidForm();
    fireEvent.click(screen.getByText('Review request'));
    fireEvent.click(screen.getByText('Back'));
    expect(screen.getByText('New RWA asset request')).toBeInTheDocument();
    expect(screen.getByLabelText(/asset name/i)).toHaveValue('Frankfurt Logistics Fund');
  });

  it('calls onCancel from the form step', () => {
    const onCancel = vi.fn();
    render(<AssetCreationWizard onCreate={vi.fn()} onCancel={onCancel} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('resets to a blank form after "Create another"', () => {
    render(<AssetCreationWizard onCreate={vi.fn()} />);
    fillValidForm();
    fireEvent.click(screen.getByText('Review request'));
    fireEvent.click(screen.getByText('Submit for review'));
    fireEvent.click(screen.getByText('Create another'));
    expect(screen.getByLabelText(/asset name/i)).toHaveValue('');
  });
});