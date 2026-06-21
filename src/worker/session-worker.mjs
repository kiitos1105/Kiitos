const intervalMs = Number(process.env.SESSION_WORKER_INTERVAL_MS ?? 60000);

console.log(`Kiitos session worker placeholder started. interval=${intervalMs}ms`);
console.log("Future jobs: cleanup stale sessions, close logs, persist focus time.");

setInterval(() => {
  console.log(`[worker] heartbeat ${new Date().toISOString()}`);
}, intervalMs);
