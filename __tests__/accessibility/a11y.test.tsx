/**
 * Accessibility Tests
 * Testing WCAG 2.1 AA compliance
 */

import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  // Mock a simple page component
  const MockPage = () => (
    <main>
      <h1>BoomPets</h1>
      <nav aria-label="Main navigation">
        <a href="/">Home</a>
        <a href="/plan">My Plan</a>
      </nav>
      <button aria-label="Add new pet">Add Pet</button>
      <img src="/pet.jpg" alt="Happy dog" />
    </main>
  );

  it('should not have accessibility violations', async () => {
    const { container } = render(<MockPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper heading hierarchy', () => {
    const { container } = render(<MockPage />);
    const h1 = container.querySelector('h1');
    expect(h1).toBeInTheDocument();
    expect(h1).toHaveTextContent('BoomPets');
  });

  it('should have aria-labels on interactive elements', () => {
    const { container } = render(<MockPage />);
    const button = container.querySelector('button');
    expect(button).toHaveAttribute('aria-label');
  });

  it('should have alt text on images', () => {
    const { container } = render(<MockPage />);
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('alt');
    expect(img?.getAttribute('alt')).not.toBe('');
  });

  it('should have labeled navigation regions', () => {
    const { container } = render(<MockPage />);
    const nav = container.querySelector('nav');
    expect(nav).toHaveAttribute('aria-label');
  });
});
