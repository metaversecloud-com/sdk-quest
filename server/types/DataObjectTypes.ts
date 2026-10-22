/**
 * Config was moved to the key asset's dataObject so Quest instances in
 * the same world don't share state. The world dataObject still holds
 * the `sceneDropId → keyAssetId` link.
 *
 * Backwards compat: deployments that pre-date this change still have
 * `numberAllowedToCollect` + `questItemImage` on the world's scene
 * entry. Reads fall back to that until an admin saves settings (which
 * writes to the key asset); the fallback stays indefinitely so old
 * worlds keep working with no migration step.
 */
export type KeyAssetDataObjectType = {
  numberAllowedToCollect?: number;
  questItemImage?: string;
  leaderboard: {
    [profileId: string]: string; // `${displayName}|${totalCollected}|${longestStreak}`
  };
};

export type WorldDataObjectType = {
  keyAssetId: string;
  /** Legacy — new code writes config to the key asset. Reads fall back here when the key asset doesn't yet have it. */
  numberAllowedToCollect?: number;
  /** Legacy — new code writes config to the key asset. Reads fall back here when the key asset doesn't yet have it. */
  questItemImage?: string;
};

export type VisitorProgressType = {
  currentStreak: number;
  lastCollectedDate: Date;
  longestStreak: number;
  totalCollected: number;
  totalCollectedToday: number;
};

export type UserDataObjectType = {
  // key = `${urlSlug}-${sceneDropId}`
  [key: string]: VisitorProgressType;
};
