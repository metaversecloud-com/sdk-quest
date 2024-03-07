import { errorHandler, getDefaultKeyAssetImage } from "../index.js";

export const initializeDroppedAssetDataObject = async ({ droppedAsset, urlSlug }) => {
  console.log("🚀 ~ file: initializeDroppedAssetDataObject.js:28 ~ initializeDroppedAssetDataObject:");

  try {
    await droppedAsset.fetchDataObject();
    if (!droppedAsset?.dataObject?.questItemImage) {
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
