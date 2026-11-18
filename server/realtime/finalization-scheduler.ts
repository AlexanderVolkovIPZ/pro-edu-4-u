/**
 * Keeps one pending finalization timer per lot. Every new bid re-arms the
 * timer, so the lot is closed by the server once the bidding goes silent
 * (or its time slot ends), regardless of whether any browser is open.
 *
 * Timers live in the process memory, which is sufficient for a single Node
 * instance; a multi-instance deployment would move this to a job queue.
 */
export class FinalizationScheduler {
  private readonly timers = new Map<string, NodeJS.Timeout>();

  schedule(lotId: string, delayMs: number, task: () => Promise<unknown>): void {
    this.cancel(lotId);

    const timer = setTimeout(
      () => {
        this.timers.delete(lotId);
        task().catch((error) => console.error('LOT_FINALIZATION_ERROR ->', error));
      },
      Math.max(0, delayMs)
    );

    // Do not keep the process alive only because of a pending finalization.
    timer.unref?.();
    this.timers.set(lotId, timer);
  }

  cancel(lotId: string): void {
    const timer = this.timers.get(lotId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(lotId);
    }
  }

  isScheduled(lotId: string): boolean {
    return this.timers.has(lotId);
  }
}

declare global {
  // eslint-disable-next-line no-var
  var finalizationScheduler: FinalizationScheduler | undefined;
}

// One scheduler per process (shared between the App Router and Pages Router bundles).
export const finalizationScheduler = (globalThis.finalizationScheduler ??= new FinalizationScheduler());
