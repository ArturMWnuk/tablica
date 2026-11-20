// Drawing latency instrumentation (NF-04 K1, T10): time from a pointer event to the end of its
// handling by the active tool, which draws the new piece of the stroke synchronously.

/** NF-04 K1: threshold for the 95th percentile, in milliseconds. */
export const LATENCY_THRESHOLD_MS = 4;

export interface LatencySummary {
  readonly count: number;
  readonly p50: number;
  readonly p95: number;
  readonly max: number;
}

/** Keeps the newest samples (a ring buffer) and reports percentiles. */
export class LatencyMeter {
  private readonly samples: number[] = [];
  private next = 0;

  constructor(private readonly capacity = 2000) {}

  record(milliseconds: number): void {
    if (!Number.isFinite(milliseconds) || milliseconds < 0) return;
    if (this.samples.length < this.capacity) this.samples.push(milliseconds);
    else this.samples[this.next] = milliseconds;
    this.next = (this.next + 1) % this.capacity;
  }

  get count(): number {
    return this.samples.length;
  }

  /** Percentile `p` (0–100) by the nearest-rank method; 0 when there are no samples. */
  percentile(p: number): number {
    if (this.samples.length === 0) return 0;
    const sorted = [...this.samples].sort((a, b) => a - b);
    const rank = Math.ceil((Math.min(100, Math.max(0, p)) / 100) * sorted.length);
    return sorted[Math.max(0, rank - 1)] ?? 0;
  }

  summary(): LatencySummary {
    return {
      count: this.count,
      p50: this.percentile(50),
      p95: this.percentile(95),
      max: this.percentile(100),
    };
  }

  reset(): void {
    this.samples.length = 0;
    this.next = 0;
  }
}
