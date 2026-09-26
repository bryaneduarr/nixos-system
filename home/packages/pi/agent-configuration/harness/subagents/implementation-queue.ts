export class ImplementationQueue {
  private tail: Promise<void> = Promise.resolve();

  async run<T>(operation: () => Promise<T>): Promise<T> {
    const previous = this.tail;
    let release = () => {};
    const queued = new Promise<void>((resolve) => {
      release = resolve;
    });
    this.tail = queued;

    await previous;

    try {
      return await operation();
    } finally {
      release();
    }
  }
}
