export const defaultInitialState = {
  hasInteractiveParams: false,
  questDetails: {
    itemsCollectedByUser: {},
    keyAssetId: "",
    lastInteractionDate: new Date(),
    numberAllowedToCollect: 5,
    sceneDropId: "",
    totalItemsCollected: 0,
    questItemImage: "",
  },
  visitor: {
    isAdmin: false,
    profileId: "",
  },
};
