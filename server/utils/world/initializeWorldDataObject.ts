import { Credentials } from "../../types/Credentials.js";
import { errorHandler } from "../errorHandler.js";
import { DroppedAsset } from "../topiaInit.js";

export const initializeWorldDataObject = async ({ credentials, world }: { credentials: Credentials; world: any }) => {
  try {
    await world.fetchDataObject();

    let { assetId, urlSlug } = credentials;
    const sceneDropId = credentials.sceneDropId || assetId;

    let questItemImage;
    if (!world.dataObject?.scenes && !world.dataObject?.scenes?.[sceneDropId]) {
      const droppedAsset = (await DroppedAsset.get(assetId, urlSlug, { credentials })) as {
        dataObject: { questItemImage?: string };
      };
      questItemImage =
        droppedAsset.dataObject?.questItemImage || "https://topiaimages.s3.us-west-1.amazonaws.com/Ruby.png";
    }

    const payload = {
      itemsCollectedByUser: {},
      keyAssetId: assetId,
      lastInteractionDate: new Date(),
      numberAllowedToCollect: 5,
      questItemImage,
      sceneDropId,
      totalItemsCollected: 0,
    };

    const lockId = `${sceneDropId}-${new Date(Math.round(new Date().getTime() / 60000) * 60000)}`;
    if (!world.dataObject?.scenes) {
      await world.setDataObject(
        {
          scenes: {
            [sceneDropId]: { ...payload },
          },
        },
        { lock: { lockId, releaseLock: true } },
      );
    } else if (!world.dataObject?.scenes?.[sceneDropId]) {
      await world.updateDataObject(
        {
          [`scenes.${sceneDropId}`]: { ...payload },
        },
        { lock: { lockId, releaseLock: true } },
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
