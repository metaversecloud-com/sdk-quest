import { error } from "../error.js";

export const initializeWorldDataObject = async ({ assetId, world, urlSlug }) => {
  try {
    const lockId = `${urlSlug}-${assetId}-keyAssetId-${new Date(Math.round(new Date().getTime() / 60000) * 60000)}`;
    if (!world.dataObject || !world.dataObject?.keyAssets) {
      await world.setDataObject(
        {
          keyAssets: {
            [assetId]: {
              itemsCollectedByUser: {},
              keyAssetId: assetId,
              numberAllowedToCollect: 5,
              totalItemsCollected: 0,
              questItemImage: "",
              questItems: {},
            },
          },
        },
        { lock: { lockId }, releaseLock: true },
      );
    } else if (!world.dataObject?.keyAssets?.[assetId]) {
      await world.updateDataObject(
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
    return;
  } catch (e) {
    error("Error initializing world data object", e);
    return await world.fetchDataObject();
  }
};
