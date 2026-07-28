import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PackageOpen, AlertTriangle } from 'lucide-react';
import EmptyState, { EmptyStateAction } from './EmptyState';

describe('EmptyState', () => {
  it('renders no-data variant with icon, title, and description', () => {
    render(
      <EmptyState
        icon={PackageOpen}
        title="No holdings yet"
        description="This address does not currently hold any Aegis RWA tokens."
      />
    );

    expect(screen.getByText('No holdings yet')).toBeInTheDocument();
    expect(screen.getByText('This address does not currently hold any Aegis RWA tokens.')).toBeInTheDocument();
  });

  it('renders unavailable variant with warning styles', () => {
    const { container } = render(
      <EmptyState
        icon={AlertTriangle}
        title="Service unavailable"
        description="The service is temporarily unavailable."
        variant="unavailable"
      />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('border-amber-300');
    expect(wrapper.className).toContain('bg-amber-50');
  });

  it('renders no-data variant with neutral styles by default', () => {
    const { container } = render(
      <EmptyState
        icon={PackageOpen}
        title="No data"
        description="No data available."
      />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('border-slate-300');
    expect(wrapper.className).toContain('bg-slate-50');
  });

  it('renders action buttons', () => {
    const mockAction = vi.fn();
    const actions: EmptyStateAction[] = [
      { label: 'Add Item', onClick: mockAction, variant: 'primary' },
      { label: 'Learn More', onClick: vi.fn(), variant: 'secondary' },
    ];

    render(
      <EmptyState
        icon={PackageOpen}
        title="No items"
        description="Add your first item to get started."
        actions={actions}
      />
    );

    expect(screen.getByText('Add Item')).toBeInTheDocument();
    expect(screen.getByText('Learn More')).toBeInTheDocument();
  });

  it('calls action onClick handler when button is clicked', () => {
    const mockAction = vi.fn();
    const actions: EmptyStateAction[] = [
      { label: 'Add Item', onClick: mockAction, variant: 'primary' },
    ];

    render(
      <EmptyState
        icon={PackageOpen}
        title="No items"
        description="Add your first item to get started."
        actions={actions}
      />
    );

    screen.getByText('Add Item').click();
    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it('renders documentation link', () => {
    render(
      <EmptyState
        icon={PackageOpen}
        title="No data"
        description="No data available."
        docsLink={{ label: 'View documentation', href: 'https://docs.example.com' }}
      />
    );

    const link = screen.getByText('View documentation');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://docs.example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders without icon when not provided', () => {
    render(
      <EmptyState
        title="No data"
        description="No data available."
      />
    );

    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(screen.getByText('No data available.')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <EmptyState
        title="No data"
        description="No data available."
        className="custom-class"
      />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('custom-class');
  });
});
