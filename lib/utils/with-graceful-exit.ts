export default function withGracefulExit<T extends (...args: any[]) => Promise<any>>(fn: T): T {
  return (async (...args: any[]) => {
    process.once('SIGINT', () => {
      console.log('\n🛑 Gracefully shutting down...');
      process.exit(0);
    });

    try {
      await fn(...args);
    } catch (err: any) {
      if (err.message === 'User force closed the prompt with SIGINT') {
        console.log('\n🛑 Migration cancelled by user.');
      } else {
        console.error('❌ An error occurred:', err);
      }
      process.exit(1);
    }
  }) as T;
}
