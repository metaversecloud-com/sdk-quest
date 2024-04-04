export type DataObjectType = {
  itemsCollectedByUser: {
    [key: string]: {
      currentStreak: number,
      lastCollectedDate: Date,
      longestStreak: number,
      total: number,
      totalCollectedToday: number,
      username: string,
    }
  },
  keyAssetId: string,
  lastInteractionDate: Date,
  numberAllowedToCollect: number,
  sceneDropId: string,
  totalItemsCollected: number,
  questItemImage: string,
}