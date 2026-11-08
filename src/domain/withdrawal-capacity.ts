/** Immediate receipt capacity is bounded by both net circuit-breaker quota and unqueued reserves. */
export function resolveReceiptWithdrawalCapacity(
  fields: Record<string, unknown>,
  nowMs: number,
  reserveFields = { balance: "receipt_balance", queued: "queued_receipt" },
): bigint {
  try {
    const windowMs = unsigned(fields.withdraw_window_ms);
    const startMs = unsigned(fields.withdraw_window_start_ms);
    const bps = unsigned(fields.withdraw_bps_per_window);
    const now = BigInt(nowMs);
    if (windowMs === 0n || startMs > now || bps === 0n || bps > 10_000n) return 0n;
    const reserve = balance(fields[reserveFields.balance]);
    const queued = unsigned(fields[reserveFields.queued]);
    if (queued >= reserve) return 0n;
    const rolled = now - startMs >= windowMs;
    const base = rolled ? reserve : unsigned(fields.withdraw_window_base_reserve);
    const withdrawn = rolled ? 0n : unsigned(fields.withdraw_window_withdrawn);
    const minted = rolled ? 0n : unsigned(fields.withdraw_window_minted);
    const used = withdrawn > minted ? withdrawn - minted : 0n;
    const quota = (base * bps) / 10_000n;
    const remaining = quota > used ? quota - used : 0n;
    const freeReserve = reserve - queued;
    return remaining < freeReserve ? remaining : freeReserve;
  } catch {
    return 0n;
  }
}

function unsigned(raw: unknown): bigint {
  if (typeof raw !== "bigint" && typeof raw !== "string" && typeof raw !== "number") throw new Error("Invalid counter");
  if (typeof raw === "number" && !Number.isSafeInteger(raw)) throw new Error("Unsafe counter");
  if (typeof raw === "string" && !/^\d+$/.test(raw)) throw new Error("Invalid counter");
  const value = BigInt(raw);
  if (value < 0n) throw new Error("Negative counter");
  return value;
}

function balance(raw: unknown): bigint {
  if (raw && typeof raw === "object") {
    const record = raw as Record<string, unknown>;
    return unsigned(record.value ?? (record.fields as Record<string, unknown> | undefined)?.value);
  }
  return unsigned(raw);
}
