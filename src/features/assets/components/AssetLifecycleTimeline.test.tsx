import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AssetLifecycleTimeline from '@/features/assets/components/AssetLifecycleTimeline';
import type { AssetLifecycleStatus } from '@/lib/assetLifecycle';

const ACTIVE_STATUS: AssetLifecycleStatus = {
  current: 'active',
  since: '2026-01-15T00:00:00Z',
  history: [{ state: 'active', occurredAt: '2026-01-15T00:00:00Z', note: 'Asset issued and activated.' }],
};

const REDEEMED_STATUS: AssetLifecycleStatus = {
  current: 'redeemed',
  since: '2026-07-15T00:00:00Z',
  history: [
    { state: 'active', occurredAt: '2025-06-01T00:00:00Z' },
    { state: 'matured', occurredAt: '2026-06-01T00:00:00Z' },
    { state: 'redeemed', occurredAt: '2026-07-15T00:00:00Z', note: 'Full redemption completed.' },
  ],
};

describe('AssetLifecycleTimeline', () => {
  it('renders the current state badge and detail copy', () => {
    render(<AssetLifecycleTimeline status={ACTIVE_STATUS} />);
    expect(screen.getAllByText('Active').length).toBeGreaterThan(0);
    expect(screen.getByText(/live/i)).toBeInTheDocument();
  });

  it('renders the full history in order, including notes', () => {
    render(<AssetLifecycleTimeline status={REDEEMED_STATUS} />);
    expect(screen.getByText('Full redemption completed.')).toBeInTheDocument();
    // All three historical labels should appear somewhere (badge + list).
    expect(screen.getAllByText('Redeemed').length).toBeGreaterThan(0);
    expect(screen.getByText('Matured')).toBeInTheDocument();
  });

  it('does not render action buttons in read-only mode (no onTransition)', () => {
    render(<AssetLifecycleTimeline status={ACTIVE_STATUS} />);
    expect(screen.queryByText(/available actions/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders one action button per allowed next state when onTransition is provided', () => {
    const onTransition = vi.fn();
    render(<AssetLifecycleTimeline status={ACTIVE_STATUS} onTransition={onTransition} />);

    expect(screen.getByText('Mark as Paused')).toBeInTheDocument();
    expect(screen.getByText('Mark as Matured')).toBeInTheDocument();
    expect(screen.getByText('Mark as Default')).toBeInTheDocument();
  });

  it('calls onTransition with the correct next state when an action button is clicked', () => {
    const onTransition = vi.fn();
    render(<AssetLifecycleTimeline status={ACTIVE_STATUS} onTransition={onTransition} />);

    fireEvent.click(screen.getByText('Mark as Paused'));

    expect(onTransition).toHaveBeenCalledTimes(1);
    expect(onTransition).toHaveBeenCalledWith('paused');
  });

  it('shows a terminal-state message instead of actions when in a terminal state', () => {
    const onTransition = vi.fn();
    render(<AssetLifecycleTimeline status={REDEEMED_STATUS} onTransition={onTransition} />);

    expect(screen.getByText(/terminal state/i)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
