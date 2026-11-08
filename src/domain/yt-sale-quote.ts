/** A zero repayment quote is an unavailable exact-PT route, not free PT. */
export function assertValidYtSaleQuote(ytIn: bigint, syOut: bigint, grossSyOut: bigint, syRepaid: bigint): void {
  if (ytIn > 0n && (syRepaid <= 0n || grossSyOut <= syRepaid || syOut !== grossSyOut - syRepaid)) {
    throw new Error("YT sale quote unavailable: insufficient PT repayment liquidity.");
  }
}
