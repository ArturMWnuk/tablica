/** Minimal synchronous change notifier used by the framework-independent core. */
export class Emitter<T = void> {
  private listeners = new Set<(value: T) => void>();

  /** Adds a listener and returns a function that removes it. */
  subscribe(listener: (value: T) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(value: T): void {
    for (const listener of [...this.listeners]) listener(value);
  }
}
