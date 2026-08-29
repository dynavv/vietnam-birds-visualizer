import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaxonomyProvider } from '../../context/TaxonomyContext';
import { GeminiFloatingButton } from './GeminiFloatingButton';

describe('GeminiFloatingButton Component Tests', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders floating button centered with icon and aria-label', () => {
    render(
      <TaxonomyProvider>
        <GeminiFloatingButton />
      </TaxonomyProvider>
    );

    const btn = screen.getByTestId('gemini-fab-button');
    expect(btn).toBeDefined();
    expect(screen.getByText('Avian AI')).toBeDefined();
    expect(btn.getAttribute('aria-label')).toBe('Mở Trợ lý Điểu học Avian AI');

    const container = screen.getByTestId('gemini-floating-container');
    expect(container.className).toContain('left-1/2');
    expect(container.className).toContain('-translate-x-1/2');
  });

  it('opens modal when floating button is clicked', () => {
    render(
      <TaxonomyProvider>
        <GeminiFloatingButton />
      </TaxonomyProvider>
    );

    const btn = screen.getByTestId('gemini-fab-button');
    fireEvent.click(btn);

    expect(screen.getByTestId('gemini-naturalist-modal')).toBeDefined();
    expect(screen.getByText('Hỏi Đáp Giám Tuyển')).toBeDefined();
  });
});
