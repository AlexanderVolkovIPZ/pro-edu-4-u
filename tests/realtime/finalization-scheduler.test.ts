import { FinalizationScheduler } from '@/server/realtime/finalization-scheduler';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('FinalizationScheduler', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('runs the task once the delay has elapsed', async () => {
    const scheduler = new FinalizationScheduler();
    const task = vi.fn().mockResolvedValue(undefined);

    scheduler.schedule('lot', 1000, task);
    expect(scheduler.isScheduled('lot')).toBe(true);

    await vi.advanceTimersByTimeAsync(999);
    expect(task).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(task).toHaveBeenCalledTimes(1);
    expect(scheduler.isScheduled('lot')).toBe(false);
  });

  it('re-arms the timer when the same lot is scheduled again', async () => {
    const scheduler = new FinalizationScheduler();
    const first = vi.fn().mockResolvedValue(undefined);
    const second = vi.fn().mockResolvedValue(undefined);

    scheduler.schedule('lot', 1000, first);
    await vi.advanceTimersByTimeAsync(500);
    scheduler.schedule('lot', 1000, second);
    await vi.advanceTimersByTimeAsync(1000);

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('can be cancelled and logs failures instead of throwing', async () => {
    const scheduler = new FinalizationScheduler();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    scheduler.schedule('cancelled', 100, vi.fn());
    scheduler.cancel('cancelled');
    scheduler.schedule('failing', 100, vi.fn().mockRejectedValue(new Error('db down')));

    await vi.advanceTimersByTimeAsync(100);

    expect(scheduler.isScheduled('cancelled')).toBe(false);
    expect(consoleError).toHaveBeenCalledWith('LOT_FINALIZATION_ERROR ->', expect.any(Error));
    consoleError.mockRestore();
  });
});
