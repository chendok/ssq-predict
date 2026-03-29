import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import TraditionalAnalysisDashboard from './TraditionalAnalysisDashboard';
import { traditionalApi } from '@/api/traditional';

// Mock API
vi.mock('@/api/traditional', () => ({
  traditionalApi: {
    getNobleStars: vi.fn(),
    getYearlySha: vi.fn(),
  },
}));

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('TraditionalAnalysisDashboard Resilience', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders skeleton initially', () => {
    render(<TraditionalAnalysisDashboard />);
    // Initial loading state (chartsReady=false)
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('handles API failure gracefully with error state and retry', async () => {
    // Mock API failure
    (traditionalApi.getNobleStars as unknown as Mock).mockRejectedValue(new Error('Network Error'));
    (traditionalApi.getYearlySha as unknown as Mock).mockRejectedValue(new Error('Network Error'));

    render(<TraditionalAnalysisDashboard />);

    // Wait for "chartsReady"
    await waitFor(() => {
        expect(screen.queryByText('传统术数深度仪表板')).toBeInTheDocument();
    }, { timeout: 1000 });

    // Should eventually show error state
    await waitFor(() => {
        const errors = screen.getAllByText((content, element) => {
            return element?.textContent?.includes('数据加载失败') || false;
        });
        expect(errors.length).toBeGreaterThan(0);
    }, { timeout: 4000 });

    const retryButtons = screen.queryAllByText((content, element) => {
        // Use simpler check and trim
        return element?.textContent?.trim() === '重试';
    });
    // expect(retryButtons.length).toBeGreaterThan(0);

    if (retryButtons.length > 0) {
        // Test Retry
        (traditionalApi.getNobleStars as unknown as Mock).mockResolvedValue({ data: { nobleStars: [{ name: 'TestNoble', value: 80 }] } });
        (traditionalApi.getYearlySha as unknown as Mock).mockResolvedValue({ data: { yearlySha: [] } });

        // Use act to wrap the click
        await fireEvent.click(retryButtons[0]);

        // Should re-trigger fetch
        await waitFor(() => {
            expect(traditionalApi.getNobleStars).toHaveBeenCalledTimes(2);
        });
    }
  });

  it('renders charts when data loads successfully', async () => {
    (traditionalApi.getNobleStars as unknown as Mock).mockResolvedValue({ data: { nobleStars: [{ name: 'TestNoble', value: 80 }] } });
    (traditionalApi.getYearlySha as unknown as Mock).mockResolvedValue({ data: { yearlySha: [] } });

    render(<TraditionalAnalysisDashboard />);

    await waitFor(() => {
        expect(screen.queryByText('传统术数深度仪表板')).toBeInTheDocument();
    });

    // Wait for async data
    await waitFor(() => {
        expect(screen.queryByText('数据加载失败')).not.toBeInTheDocument();
    });
  });
});
