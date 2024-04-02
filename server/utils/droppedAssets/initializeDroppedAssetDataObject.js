import { errorHandler, getDefaultKeyAssetImage } from "../index.js";

export const initializeDroppedAssetDataObject = async ({ droppedAsset, urlSlug }) => {
  try {
    await droppedAsset.fetchDataObject();
    if (droppedAsset.dataObject?.keyAssetId) return;

    if (!droppedAsset.dataObject?.questItemImage) {
      const lockId = `${droppedAsset.id}-${new Date(Math.round(new Date().getTime() / 60000) * 60000)}`;
      const questItemImage = await getDefaultKeyAssetImage({ urlSlug });
      await droppedAsset.setDataObject(
        {
          numberAllowedToCollect: 5,
          questItemImage,
        },
        { analytics: ["newQuestAddedToWorldCount"], lock: { lockId, releaseLock: true } },
      );
    }

    return;
  } catch (error) {
    errorHandler({
      error,
      functionName: "initializeDroppedAssetDataObject",
      message: "Error initializing dropped asset data object",
    });
    return await droppedAsset.fetchDataObject();
  }
};
