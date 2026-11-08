export const DEFAULT_TRANSACTION_TTL_MS = 10 * 60 * 1_000;

/** Omission expires in ten minutes; explicit zero intentionally disables expiry. */
export function resolveDeadlineMs(value?: bigint, nowMs = Date.now()): bigint {
  const deadline = value ?? BigInt(nowMs + DEFAULT_TRANSACTION_TTL_MS);
  if (deadline < 0n || deadline > (1n << 64n) - 1n) throw new Error("deadlineMs must fit u64.");
  return deadline;
}
