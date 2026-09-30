# Current adapter v2

Targets the proposed deposit-first ABI. Configure the upgraded adapter package
only after deployment, version activation and genuine upstream integration tests.
This SDK change does not deploy contracts or publish a release to npm.

## Configuration

In addition to the normal Jitter market/oracle/SY fields, provide:

- `adapterKind: "current"`
- `currentAdapterPackageId`
- `currentProtocolTypeTag` (Current's `P`, not the underlying coin type)
- `currentMarketVaultObjectId` (Jitter adapter vault)
- `currentProtocolAppObjectId`
- `currentMarketObjectId` (upstream Current market)
- `currentDecimalsRegistryObjectId` (redemption)
- `currentXOracleObjectId` (redemption)

Use `createJitterSdk(...).forMarket(config).transactions` or
`createJitterTransactionService`. Legacy demo-only builders are not Current routes.

## Deposit first

`buildDepositToSyTx` requires `minSyOut` for Current. The SDK composes
`deposit_and_quote -> aggregate -> finish_deposit` in the same PTB. The entire
input coin passed to `addCurrentDepositToSy` is consumed; the service first
splits the requested underlying amount. The linear receipt is always consumed.
There is no pre-deposit SY mint and no extra donation for this initial quote.

Underlying-funded Buy PT/YT and Add LP use the same flow, then protect final
output with the existing PT/YT/LP minima. Their intermediate SY minimum is one
raw unit, not a replacement for the product-level slippage limit.

## Refresh funding

Every standalone Current price collection calls `refresh_and_quote`, never the
disabled `quote`. It spends one **raw underlying unit per collection**, not one
whole token and not SUI unless SUI is the underlying. Multiple price consumers
in one PTB can require multiple units. This donation is separate from gas and
trade input and is not credited as user SY.

Service builders select sender-owned funding with `coinWithBalance`, without
using the gas coin. Keep a separate underlying coin available: coin selection
excludes objects already used as explicit trade inputs. Insufficient funding,
deposit pause or upstream caps cause failure; no stale-price fallback is used.

For custom PTBs, `addCurrentPriceInfo(tx, config, fundingCoin)` borrows an
explicit coin and leaves its remainder with the caller. Without that argument,
the transaction must have a sender; the selected funding coin's remainder is
returned to that sender, including if a future official refresh spends zero.
The returned PriceInfo must be consumed in the same PTB.

The strategy stays behind the manifest/primitive boundary. A compatible
contract upgrade can switch to the official refresh API without changing the
public SDK call, provided it preserves the Move signature.

## Preview and execution

Supply an accrued `syIndex` or `resolveSyIndex` for transaction hints and price
previews. The SDK does not treat stored PY index or demo 1:1 as a Current quote.
The caller-provided value is an estimate, not oracle authority: execution still
refreshes Current and validates the canonical aggregator on-chain.

No automatic mainnet Current quote resolver is included in this change. A
resolver must obtain an accrued value (for example from a funded read-only PTB
simulation) and must not merely timestamp the stored exchange rate as fresh.

## Validation boundary

Tests inspect command order, type arguments, arity, receipt/result consumption,
minimum output encoding, missing-config failures, legacy-route rejection and
service routing for deposits, swaps, LP entry/exit and SY redemption. They are
PTB construction tests, not execution against Current's live bytecode.
