import { Credentials } from "../../types/Credentials.js";
import { standardizeError } from "../standardizeError.js";
import { DroppedAsset } from "../topiaInit.js";

export const initializeWorldDataObject = async ({ credentials, world }: { credentials: Credentials; world: any }) => {
  try {
    const { assetId, urlSlug } = credentials;
    const sceneDropId = credentials.sceneDropId || assetId;

    await world.fetchDataObject();
    const dataObject = world.dataObject;

    let payload = {
      keyAssetId: assetId,
      numberAllowedToCollect: 5,
      questItemImage: "https://topiaimages.s3.us-west-1.amazonaws.com/Ruby.png",
    };

    let shouldUpdate = false;

    if (!world.dataObject?.scenes || !world.dataObject?.scenes?.[sceneDropId]) {
      const droppedAsset = (await DroppedAsset.get(assetId, urlSlug, { credentials })) as {
        dataObject: { questItemImage?: string };
      };
      const questItemImage =
        droppedAsset.dataObject?.questItemImage || "https://topiaimages.s3.us-west-1.amazonaws.com/Ruby.png";

      payload = {
        keyAssetId: assetId,
        numberAllowedToCollect: 5,
        questItemImage,
      };
    }

    const lockId = `${sceneDropId}-${new Date(Math.round(new Date().getTime() / 60000) * 60000)}`;
    if (!dataObject || !dataObject?.scenes) {
      await world.setDataObject(
        {
          scenes: {
            [sceneDropId]: { ...payload },
          },
        },
        { lock: { lockId, releaseLock: true } },
      );
    } else {
      // remove profile from all scenes in data object to clean up legacy data
      Object.keys(dataObject.scenes).forEach((key) => {
        if (dataObject.scenes[key].itemsCollectedByUser) {
          delete dataObject.scenes[key].itemsCollectedByUser;
          delete dataObject.scenes[key].lastInteractionDate;
          delete dataObject.scenes[key].sceneDropId;
          delete dataObject.scenes[key].totalItemsCollected;
          shouldUpdate = true;
        }
      });

      if (!dataObject.scenes[sceneDropId]) {
        dataObject.scenes[sceneDropId] = { ...payload };
        shouldUpdate = true;
      }

      if (shouldUpdate) {
        await world.updateDataObject(dataObject, { lock: { lockId, releaseLock: true } });
      }
    }

    await world.fetchDataObject();
    return;
  } catch (error) {
    standardizeError(error);
    return await world.fetchDataObject();
  }
};
