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

export type UserDataObjectType = {
  [key: string]: {
    // key = `${urlSlug}-${sceneDropId}`
    currentStreak: number;
    lastCollectedDate: Date;
    longestStreak: number;
    totalCollected: number;
    totalCollectedToday: number;
  };
};
