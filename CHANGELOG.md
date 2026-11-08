# Changelog

## 0.2.0 - 2026-11-08

### Source And Scope

Runtime source, generated bindings and regression tests are synchronized from
the production application snapshot at commit
`3fd2a348ea2419330dc2a02f46399c8356fb1df5` (SDK source is unchanged from that
snapshot). Standalone package metadata, CI, publish configuration and
`JITTER_CONTRACT_ROOT` support are retained. No private environment files,
credentials, frontend code or unmerged contract experiments are included.

### Changes

- Reviewed Core v3 runtime/dependency routing, preserving original type lineage
  and existing state/position object IDs.
- Full-liquidity Keep/Non-Keep preparation through the canonical Router routes,
  explicit minimum outputs, bounded deadlines, classified preparation failures
  and optional retained-input policy. Preparation simulates; it never signs or
  submits. Curve/precision failures remain failures, not guaranteed fills.
- Gas headroom for build/simulation, including coin-intent expansion.
- Optional returned-SY redemption with zero-output execution guards; receipt
  assets and native assets remain distinct. Mainnet deposit-dust handling and
  its configuration are synchronized with the application.
- Haedal/Ember receipt and withdrawal-queue helpers, current stablecoin routes,
  Registry v2 discovery/validation/builders, points/reward reads and settlement.
- gRPC pagination and owned-inventory fixes; market valuation, timestamps,
  withdrawal-capacity and missing/stale analytics semantics.
- Refreshed generated bindings and regression coverage.

### Integration Notes

- `@mysten/sui` minimum dependency range is now `^2.23.1`.
- Node.js 22 or newer is required, matching the Sui dependency's runtime floor.
- Use package-root exports, preferably `createJitterSdk`. Review low-level
  generated bindings and Registry v2 types when upgrading from 0.1.0; old
  generated contract shapes are not a compatibility guarantee.
- Preserve raw `bigint` amounts and each coin's decimals. SY and receipt asset
  decimals can differ; do not infer one from the other.
- Re-simulate current state before signing. This synchronization is not a new
  security audit or proof that all inputs/markets can execute.
- No npm publication/tag is implied by updating this repository.

### Validation

- 255 tracked source/test files match the production SDK snapshot byte-for-byte.
- Standalone `bun run check`: 648 passed, nine optional live tests skipped,
  zero failures; typecheck and production build passed.
- Frozen-lockfile install and contract-structure audit passed against the
  matching source checkout. This is a struct-field drift check, not formal
  verification or a complete on-chain ABI/security audit.
- Local tarball installed in an isolated consumer; package-root ESM exports and
  facade construction and consumer TypeScript compilation passed without
  network requests or signing. Archive allowlist: dist, package metadata,
  README and changelog only (687 files; 545,645 compressed bytes).
- No npm publication was performed. Consumers do not need Move sources to
  install/build the SDK; maintainers need a matching `JITTER_CONTRACT_ROOT`
  checkout for contract-surface audit/code generation.
