import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingOverlay } from '../../components/LoadingOverlay';

describe('LoadingOverlay', () => {
  it('renders loading indicator and message', () => {
    render(<LoadingOverlay />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Loading' })).toHaveClass('animate-spin');
  });

  it('applies correct styling', () => {
    render(<LoadingOverlay />);
    const overlay = screen.getByTestId('loading-overlay');
    expect(overlay).toHaveClass('fixed', 'inset-0', 'bg-gray-900/50', 'backdrop-blur-sm');
  });
});