/** Exact group accrual after the caller resolves policy cutoff and pause time. */
export function linearGroupAccrued(group: {
  rate: bigint;
  duration: bigint;
  updatedAt: bigint;
  remainder: bigint;
  pausedAtUpdate: bigint;
}, effectiveNow: bigint, effectivePaused: bigint): bigint {
  if (group.duration <= 0n || group.remainder < 0n || group.remainder >= group.duration) {
    throw new Error("Invalid linear group denominator or remainder.");
  }
  const elapsed = effectiveNow > group.updatedAt ? effectiveNow - group.updatedAt : 0n;
  const pause = effectivePaused > group.pausedAtUpdate ? effectivePaused - group.pausedAtUpdate : 0n;
  const active = elapsed > pause ? elapsed - pause : 0n;
  return (group.rate * active + group.remainder) / group.duration;
}

/** Exact display-rate addition; BigInt avoids imposing a u64 LCM bound. */
export function addLinearRate(a: { rate: bigint; duration: bigint }, b: { rate: bigint; duration: bigint }) {
  function gcd(x: bigint, y: bigint): bigint {
    while (y !== 0n) [x, y] = [y, x % y];
    return x;
  }
  const common = gcd(a.duration, b.duration);
  const duration = (a.duration / common) * b.duration;
  const rate = a.rate * (b.duration / common) + b.rate * (a.duration / common);
  const reduction = gcd(rate, duration);
  return { rate: rate / reduction, duration: duration / reduction };
}
