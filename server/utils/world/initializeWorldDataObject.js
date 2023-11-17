import { error } from "../error.js";

export const initializeWorldDataObject = async ({ assetId, world, urlSlug }) => {
  try {
    if (!world.dataObject || !world.dataObject?.keyAssets?.[assetId]) {
      const lockId = `${urlSlug}-keyAssetId-${new Date(Math.round(new Date().getTime() / 60000) * 60000)}`;
      world.setDataObject(
        {
          [`keyAssets.${assetId}`]: {
            itemsCollectedByUser: {},
            keyAssetId: assetId,
            numberAllowedToCollect: 5,
            totalItemsCollected: 0,
            questItemImage: "",
            questItems: {},
          },
        },
        { lock: { lockId }, releaseLock: true },
      );
    }
    return world;
  } catch (e) {
    error("Error initializing world data object", e);
  }
};
