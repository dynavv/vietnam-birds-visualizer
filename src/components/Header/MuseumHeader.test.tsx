import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MuseumHeader } from './MuseumHeader';
import { TaxonomyProvider, useTaxonomy } from '../../context/TaxonomyContext';

const TestHeaderContainer: React.FC = () => {
  const { activeView, selectedSpecies } = useTaxonomy();

  return (
    <div>
      <MuseumHeader />
      <div data-testid="current-view">{activeView}</div>
      <div data-testid="current-species">{selectedSpecies?.id}</div>
    </div>
  );
};

describe('MuseumHeader Component', () => {
  it('renders museum brand title, 3 navigation tabs and random explorer button', () => {
    render(
      <TaxonomyProvider>
        <TestHeaderContainer />
      </TaxonomyProvider>
    );

    expect(screen.getByText('Avifauna of Vietnam')).toBeDefined();
    expect(screen.getByText(/Giám tuyển & Trực quan hóa Phân loại học/i)).toBeDefined();

    // 3 Tabs
    expect(screen.getByText('Bản đồ Sinh thái')).toBeDefined();
    expect(screen.getByText('Bánh xe Phân loại')).toBeDefined();
    expect(screen.getByText('Trình Giám tuyển')).toBeDefined();

    // Random button
    expect(screen.getByLabelText(/Khám phá ngẫu nhiên/i)).toBeDefined();
  });

  it('switches views when clicking tabs', () => {
    render(
      <TaxonomyProvider>
        <TestHeaderContainer />
      </TaxonomyProvider>
    );

    expect(screen.getByTestId('current-view').textContent).toBe('map');

    fireEvent.click(screen.getByText('Bánh xe Phân loại'));
    expect(screen.getByTestId('current-view').textContent).toBe('sunburst');

    fireEvent.click(screen.getByText('Trình Giám tuyển'));
    expect(screen.getByTestId('current-view').textContent).toBe('curator');

    fireEvent.click(screen.getByText('Bản đồ Sinh thái'));
    expect(screen.getByTestId('current-view').textContent).toBe('map');
  });

  it('triggers random endemic selection when clicking random button', () => {
    render(
      <TaxonomyProvider>
        <TestHeaderContainer />
      </TaxonomyProvider>
    );

    const randomBtn = screen.getByLabelText(/Khám phá ngẫu nhiên/i);
    fireEvent.click(randomBtn);

    const currentSpecies = screen.getByTestId('current-species').textContent;
    expect(currentSpecies).toBeTruthy();
  });
});
