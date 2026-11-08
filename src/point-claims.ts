/** JSON-safe receipt metadata. Archived points are not tokenized or available balances. */
export type ClosedPointClaim = {
  objectId: string;
  pointConfigObjectId: string;
  projectObjectId: string;
  scoreboardObjectId: string;
  marketObjectId: string;
  sourceObjectId: string;
  positionObjectId: string;
  owner: string;
  scope: "yt" | "lp";
  points: string;
  remainder: string;
  precision: string;
  closedAtMs: string;
  referralStateObjectId: string | null;
  referralRecordObjectId: string | null;
};

export type DeferredReferralClaim = {
  objectId: string;
  owner: string;
  referee: string;
  projectObjectId: string;
  projectId: string;
  stateObjectId: string;
  sourceObjectId: string;
  sourceWitness: string;
  marketObjectId: string;
  positionObjectId: string;
  recordObjectId: string;
  scope: "yt" | "lp";
  points: string;
  remainder: string;
  precision: string;
  pointConfigObjectId: string;
  scoreboardObjectId: string;
};
