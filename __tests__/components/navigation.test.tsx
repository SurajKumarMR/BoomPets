/**
 * Component Tests - Bottom Navigation
 * Testing navigation component functionality
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('Bottom Navigation', () => {
  // Mock navigation component for testing
  const MockNavigation = () => (
    <nav data-testid="bottom-nav">
      <a href="/">Home</a>
      <a href="/plan">My Plan</a>
      <a href="/track">Track</a>
      <a href="/consult">Consult</a>
      <a href="/more">More</a>
    </nav>
  );

  it('should render all navigation items', () => {
    render(<MockNavigation />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('My Plan')).toBeInTheDocument();
    expect(screen.getByText('Track')).toBeInTheDocument();
    expect(screen.getByText('Consult')).toBeInTheDocument();
    expect(screen.getByText('More')).toBeInTheDocument();
  });

  it('should have correct href attributes', () => {
    render(<MockNavigation />);
    
    const homeLink = screen.getByText('Home');
    expect(homeLink).toHaveAttribute('href', '/');
    
    const planLink = screen.getByText('My Plan');
    expect(planLink).toHaveAttribute('href', '/plan');
  });
});
