import { expect, test } from "bun:test";
import { createJitterTransactionService } from "../services/transaction-service.js";
import { EMBER_EEARN } from "../ember-deployment.js";
import { makeTestMarketConfig } from "./fakes.js";

const id = (n: number) => `0x${n.toString(16).padStart(64, "0")}`;
const e = EMBER_EEARN;
const config = makeTestMarketConfig({
  adapterKind: "ember",
  underlyingTypeTag: e.underlyingType,
  underlyingDecimals: 6,
  marketDecimals: 6,
  emberAdapterPackageId: e.adapterPackageId,
  emberMarketVaultObjectId: id(1),
  emberVaultObjectId: e.vaultObjectId,
  emberVaultsPackageId: e.callPackageId,
  emberProtocolConfigObjectId: e.protocolConfigObjectId,
  emberReceiptTypeTag: e.receiptType,
  jitterMathPackageId: id(2),
  globalConfigObjectId: id(3),
  rewardDistributorObjectId: id(4),
  marketObjectId: id(18),
  syStateObjectId: id(19),
});
const args = {
  senderAddress: id(5),
  positionId: id(6),
  syIndex: 1n << 64n,
  rewardSettlement: { strategy: "empty-vector" as const },
  minPtOut: 1n,
  minYtOut: 1n,
  minSyOut: 1n,
  minLpOut: 1n,
  syToMintHint: 50_000_000n,
  underlyingAmount: 100_000_000n,
  inputCoinId: id(7),
  underlyingCoinId: id(7),
  inputAmount: 100_000_000n,
  ptAmount: 10_000_000n,
  ytAmount: 10_000_000n,
};
for (const method of [
  "buildBuyPtFromUnderlyingTx",
  "buildBuyYtFromUnderlyingTx",
  "buildAddLpKeepYtFromUnderlyingTx",
  "buildAddLpFromSyFromUnderlyingTx",
] as const) {
  test(`eEARN ${method} accepts address balances without fabricating coin IDs`, async () => {
    const tx = await createJitterTransactionService({ config })[method]({
      ...args,
      minYtOut: method.includes("KeepYt") ? 0n : args.minYtOut,
      underlyingCoinId: undefined,
    });
    const intent = tx.getData().commands.find((c) => c.$Intent)?.$Intent;
    expect(intent?.data.type).toBe(e.underlyingType);
    expect(String(intent?.data.balance)).toBe("100000000");
  });
  test(`eEARN ${method} deposits USDC into the reviewed vault, never SUI`, async () => {
    const tx = await createJitterTransactionService({ config })[method]({
      ...args, minYtOut: method.includes("KeepYt") ? 0n : args.minYtOut,
    });
    const calls = tx
      .getData()
      .commands.flatMap((c) => (c.MoveCall ? [c.MoveCall] : []));
    const deposit = calls.find((c) => c.function === "deposit_asset_v2");
    expect(deposit?.typeArguments).toEqual([e.underlyingType, e.receiptType]);
    expect(deposit?.package).toBe(e.callPackageId);
    expect(calls.some((c) => c.function === "redeem_shares")).toBe(false);
    expect(
      calls.some(
        (c) => c.module.includes("scallop") || c.module.includes("haedal"),
      ),
    ).toBe(false);
  });
}
for (const product of ["Pt", "Yt"] as const) {
  test(`eEARN ${product} exits return eEARN receipts, not USDC`, async () => {
    const service = createJitterTransactionService({ config });
    await expect(
      service[`buildSell${product}ToUnderlyingTx`](args),
    ).rejects.toThrow("underlying");
    const tx = await service[`buildSell${product}ToReceiptTx`](args);
    const calls = tx
      .getData()
      .commands.flatMap((c) => (c.MoveCall ? [c.MoveCall] : []));
    expect(
      calls
        .find((c) => c.function === "redeem_receipt")
        ?.typeArguments?.slice(0, 2),
    ).toEqual([e.underlyingType, e.receiptType]);
    expect(calls.some((c) => c.function === "redeem_shares")).toBe(false);
  });
}
