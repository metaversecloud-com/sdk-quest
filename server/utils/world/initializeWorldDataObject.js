import { errorHandler } from "../errorHandler.js";
import { getDefaultKeyAssetImage } from "../getDefaultKeyAssetImage.js";

export const initializeWorldDataObject = async ({ credentials, world, urlSlug }) => {
  try {
    const { assetId } = credentials;
    const lockId = `${urlSlug}-${assetId}-keyAssetId-${new Date(Math.round(new Date().getTime() / 60000) * 60000)}`;
    if (!world.dataObject || !world.dataObject?.keyAssets) {
      const questItemImage = await getDefaultKeyAssetImage({ urlSlug });
      await world.setDataObject(
        {
          keyAssets: {
            [assetId]: {
              itemsCollectedByUser: {},
              keyAssetId: assetId,
              numberAllowedToCollect: 5,
              totalItemsCollected: 0,
              questItemImage,
              questItems: {},
            },
          },
        },
        { lock: { lockId }, releaseLock: true },
      );
    } else if (!world.dataObject?.keyAssets?.[assetId]) {
      const questItemImage = await getDefaultKeyAssetImage({ urlSlug });
      await world.updateDataObject(
        {
          [`keyAssets.${assetId}`]: {
            itemsCollectedByUser: {},
            keyAssetId: assetId,
            numberAllowedToCollect: 5,
            totalItemsCollected: 0,
            questItemImage,
            questItems: {},
          },
        },
        { lock: { lockId }, releaseLock: true },
      );
    }
    return;
  } catch (error) {
    errorHandler({
      error,
      functionName: "initializeWorldDataObject",
      message: "Error initializing world data object",
    });
    return await world.fetchDataObject();
  }
};
