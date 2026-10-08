/**
 * Tier 1 Rate Limiter & Priority Queue with Auto-Retry
 * 
 * Regulates requests to free Tier 1 services (Jina Reader, Web Search)
 * Max Limit: 200 requests / minute (60-second sliding window).
 * 
 * Features:
 * - Rolling 60s window tracking
 * - Queueing when requests exceed 200/min or HTTP 429 encountered
 * - Auto-retry with exponential backoff for background processes
 * - Interactive retry metadata for foreground user requests
 */

export interface Tier1QueueOptions {
  isBackground?: boolean;
  maxRetries?: number;
  initialBackoffMs?: number;
  timeoutMs?: number;
  label?: string;
}

export interface Tier1Metrics {
  currentRpm: number;
  maxRpm: number;
  queuedCount: number;
  isThrottled: boolean;
  nextAvailableInMs: number;
  totalProcessed: number;
  totalRetried: number;
}

const MAX_RPM = 200;
const WINDOW_MS = 60_000; // 60 seconds

class Tier1RateLimiter {
  private timestamps: number[] = [];
  private queue: Array<{
    id: string;
    task: () => Promise<any>;
    resolve: (val: any) => void;
    reject: (err: any) => void;
    options: Tier1QueueOptions;
    retries: number;
    enqueuedAt: number;
  }> = [];
  private isProcessing = false;
  private totalProcessed = 0;
  private totalRetried = 0;
  private throttleUntil = 0;

  constructor() {
    // Clean up timestamps periodically
    setInterval(() => this.cleanupTimestamps(), 5000);
  }

  private cleanupTimestamps() {
    const now = Date.now();
    const cutoff = now - WINDOW_MS;
    while (this.timestamps.length > 0 && this.timestamps[0] < cutoff) {
      this.timestamps.shift();
    }
  }

  public getMetrics(): Tier1Metrics {
    this.cleanupTimestamps();
    const now = Date.now();
    const isThrottled = this.timestamps.length >= MAX_RPM || now < this.throttleUntil;
    let nextAvailableInMs = 0;

    if (now < this.throttleUntil) {
      nextAvailableInMs = this.throttleUntil - now;
    } else if (this.timestamps.length >= MAX_RPM) {
      nextAvailableInMs = Math.max(0, this.timestamps[0] + WINDOW_MS - now);
    }

    return {
      currentRpm: this.timestamps.length,
      maxRpm: MAX_RPM,
      queuedCount: this.queue.length,
      isThrottled,
      nextAvailableInMs,
      totalProcessed: this.totalProcessed,
      totalRetried: this.totalRetried,
    };
  }

  /**
   * Execute a task wrapped with rate-limiting, queueing, and auto-retry logic.
   */
  public async execute<T>(task: () => Promise<T>, options: Tier1QueueOptions = {}): Promise<T> {
    const { isBackground = false, maxRetries = isBackground ? 5 : 2 } = options;

    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        id: `t1_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        task,
        resolve,
        reject,
        options: { ...options, isBackground, maxRetries },
        retries: 0,
        enqueuedAt: Date.now(),
      });

      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      while (this.queue.length > 0) {
        this.cleanupTimestamps();
        const now = Date.now();

        // Check if rate limited
        if (this.timestamps.length >= MAX_RPM || now < this.throttleUntil) {
          const waitMs = now < this.throttleUntil
            ? this.throttleUntil - now + 100
            : Math.max(100, this.timestamps[0] + WINDOW_MS - now + 100);

          console.log(`[Tier 1 Limiter] Rate limit reached (${this.timestamps.length}/${MAX_RPM}). Queue waiting ${waitMs}ms. Queued items: ${this.queue.length}`);
          await new Promise((r) => setTimeout(r, Math.min(waitMs, 5000)));
          continue;
        }

        const item = this.queue.shift();
        if (!item) break;

        // Record request timestamp
        this.timestamps.push(Date.now());
        this.totalProcessed++;

        // Execute task
        try {
          const result = await item.task();
          item.resolve(result);
        } catch (err: any) {
          const is429 =
            err?.status === 429 ||
            err?.statusCode === 429 ||
            (err?.message && (err.message.includes("429") || err.message.toLowerCase().includes("too many requests")));

          if (is429) {
            this.totalRetried++;
            // Pause all upcoming queue processing for 3 seconds
            this.throttleUntil = Date.now() + 3000;
          }

          // Check if retry is allowed
          if (is429 && item.retries < (item.options.maxRetries || 3)) {
            item.retries++;
            const backoffDelay = Math.min((item.options.initialBackoffMs || 1500) * Math.pow(2, item.retries - 1), 30000);
            console.warn(`[Tier 1 Limiter] 429 Too Many Requests. Retrying in ${backoffDelay}ms (attempt ${item.retries}/${item.options.maxRetries}) for ${item.options.label || item.id}`);

            if (item.options.isBackground) {
              // Auto-retry in background: re-enqueue with backoff
              setTimeout(() => {
                this.queue.unshift(item);
                this.processQueue();
              }, backoffDelay);
            } else {
              // For interactive users, also wait and retry
              setTimeout(() => {
                this.queue.unshift(item);
                this.processQueue();
              }, backoffDelay);
            }
          } else {
            // Retries exhausted or non-429 error
            item.reject(err);
          }
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }
}

// Global Singleton
const globalLimiter = new Tier1RateLimiter();

export function getTier1RateLimiter(): Tier1RateLimiter {
  return globalLimiter;
}

export async function executeTier1WithQueue<T>(
  task: () => Promise<T>,
  options: Tier1QueueOptions = {}
): Promise<T> {
  return globalLimiter.execute(task, options);
}
