export type KeyAssetDataObjectType = {
  questItemImage?: string;
  leaderboard: {
    [profileId: string]: string; // `${displayName}|${totalCollected}|${longestStreak}`
  };
};

export type WorldDataObjectType = {
  keyAssetId: string;
  numberAllowedToCollect: number;
  questItemImage: string;
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
