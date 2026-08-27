import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConservationBadge } from './ConservationBadge';
import { EndemicBadge } from './EndemicBadge';
import type { IUCNStatus } from '../../types/bird';

describe('ConservationBadge Component', () => {
  const statuses: { code: IUCNStatus; vi: string }[] = [
    { code: 'CR', vi: 'Cực kỳ nguy cấp' },
    { code: 'EN', vi: 'Nguy cấp' },
    { code: 'VU', vi: 'Sắp nguy cấp' },
    { code: 'NT', vi: 'Gần bị đe dọa' },
    { code: 'LC', vi: 'Nguy cơ thấp' }
  ];

  statuses.forEach(({ code, vi }) => {
    it(`renders IUCN ${code} with Vietnamese label "${vi}"`, () => {
      render(<ConservationBadge status={code} />);
      expect(screen.getByText(code)).toBeDefined();
      expect(screen.getByText(vi)).toBeDefined();
    });
  });

  it('renders Vietnam Red List status tag when provided', () => {
    render(<ConservationBadge status="CR" vietnamRedList="CR" />);
    expect(screen.getByText('VN:CR')).toBeDefined();
  });

  it('hides text label when showLabel is false', () => {
    render(<ConservationBadge status="VU" showLabel={false} />);
    expect(screen.getByText('VU')).toBeDefined();
    expect(screen.queryByText('Sắp nguy cấp')).toBeNull();
  });
});

describe('EndemicBadge Component', () => {
  it('renders standard full label by default', () => {
    render(<EndemicBadge />);
    expect(screen.getByText('Đặc hữu Việt Nam')).toBeDefined();
  });

  it('renders compact label when compact is true', () => {
    render(<EndemicBadge compact />);
    expect(screen.getByText('Đặc hữu')).toBeDefined();
  });
});
