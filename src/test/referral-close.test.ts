import { expect, test } from "bun:test";
import { Transaction } from "@mysten/sui/transactions";
import { normalizeSuiAddress } from "@mysten/sui/utils";
import { addCloseReferralCampaign, type CloseReferralCampaignArgs } from "../referral.js";

const args: CloseReferralCampaignArgs = {
  extensionsPackageId: "0x10", globalConfigObjectId: "0x11", adminCapObjectId: "0x12",
  liquidlinkGlobalConfigObjectId: "0x13", projectCapObjectId: "0x14", projectObjectId: "0x15",
  scoreboardObjectId: "0x16", referralStateObjectId: "0x17", pointConfigObjectIds: ["0x18"],
};

test("close retains referral registration and binds all nine ABI arguments", () => {
  const tx = new Transaction();
  addCloseReferralCampaign(tx, args);
  const data = tx.getData();
  const call = data.commands[0].MoveCall!;
  expect(data.commands).toHaveLength(1);
  expect(call.function).toBe("close_referral_campaign_by_admin");
  expect(call.module).toBe("liquidlink_points");
  expect(call.arguments).toHaveLength(9);
  const ids = call.arguments.map((arg) => {
    if (arg.$kind !== "Input") throw new Error("Expected object input");
    const input = data.inputs[arg.Input];
    return input.UnresolvedObject?.objectId ?? input.Object?.SharedObject?.objectId;
  });
  expect(ids).toEqual(["0x18", "0x11", "0x12", "0x13", "0x14", "0x15", "0x16", "0x17", "0x6"].map((id) => normalizeSuiAddress(id)));
});

test("every config uses the binding-checked close in one PTB, with normalized deduplication", () => {
  const tx = new Transaction();
  addCloseReferralCampaign(tx, { ...args, pointConfigObjectIds: ["0x18", "0x0018", " 0x1A ", "0x1a"] });
  const calls = tx.getData().commands.map((c) => c.MoveCall!);
  expect(calls).toHaveLength(2);
  expect(calls.map((c) => c.function)).toEqual(["close_referral_campaign_by_admin", "close_referral_campaign_by_admin"]);
  expect(calls[0].arguments.slice(1)).toEqual(calls[1].arguments.slice(1));
});

for (const ids of [[], ["0x18", "bad"], [""], ["0x" + "1".repeat(65)]]) {
  test(`invalid config list leaves transaction untouched: ${JSON.stringify(ids)}`, () => {
    const tx = new Transaction();
    expect(() => addCloseReferralCampaign(tx, { ...args, pointConfigObjectIds: ids })).toThrow();
    expect(tx.getData().commands).toHaveLength(0);
    expect(tx.getData().inputs).toHaveLength(0);
  });
}

test("missing campaign authority is rejected before adding commands", () => {
  const tx = new Transaction();
  expect(() => addCloseReferralCampaign(tx, { ...args, projectCapObjectId: "" })).toThrow();
  expect(tx.getData().commands).toHaveLength(0);
});
