import { errorHandler } from "../errorHandler.js";

export const initializeWorldDataObject = async ({ credentials, world, urlSlug }) => {
  try {
    const { assetId } = credentials;
    const lockId = `${urlSlug}-${assetId}-keyAssetId-${new Date(Math.round(new Date().getTime() / 60000) * 60000)}`;
    if (!world.dataObject || !world.dataObject?.keyAssets) {
      await world.setDataObject(
        {
          keyAssets: {
            [assetId]: {
              itemsCollectedByUser: {},
              keyAssetId: assetId,
              totalItemsCollected: 0,
              questItems: {},
            },
          },
        },
        { lock: { lockId, releaseLock: true } },
      );
    } else if (!world.dataObject?.keyAssets?.[assetId]) {
      await world.updateDataObject(
        {
          [`keyAssets.${assetId}`]: {
            itemsCollectedByUser: {},
            keyAssetId: assetId,
            totalItemsCollected: 0,
            questItems: {},
          },
        },
        { lock: { lockId, releaseLock: true } },
      );
    }
    return;
  } catch (error) {
    return errorHandler({
      error,
      functionName: "initializeWorldDataObject",
      message: "Error initializing world data object",
    });
    return await world.fetchDataObject();
  }
};
