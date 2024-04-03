import { errorHandler, getDefaultKeyAssetImage } from "../index.js";
import { Credentials } from '../../types/Credentials';

export const initializeDroppedAssetDataObject = async ({ credentials, droppedAsset }: { credentials: Credentials, droppedAsset: any }) => {
  try {
    const { dataObject, id } = droppedAsset
    await droppedAsset.fetchDataObject();
    if (dataObject?.keyAssetId) return;

    if (!dataObject?.questItemImage) {
      const lockId = `${id}-${new Date(Math.round(new Date().getTime() / 60000) * 60000)}`;
      const questItemImage = await getDefaultKeyAssetImage(credentials);
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
