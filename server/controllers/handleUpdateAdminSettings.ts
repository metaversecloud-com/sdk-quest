import { Request, Response } from "express";
import { errorHandler, getCredentials, getKeyAsset, getQuestItems, getWorldDetails } from "../utils/index.js";
import { KeyAssetDataObjectType, WorldDataObjectType } from "../types/DataObjectTypes.js";

export const handleUpdateAdminSettings = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { numberAllowedToCollect, questItemImage } = req.body;

    if (!questItemImage) throw "questItemImage is required";

    // Resolve the key asset through the world's `sceneDropId → keyAssetId`
    // link. `handleUpdateAdminSettings` runs on the key asset click, so
    // `credentials.assetId` is normally the key asset itself; the world
    // scene's `keyAssetId` falls back to that if the mapping is missing.
    const { dataObject: worldSceneData } = await getWorldDetails(credentials, false);
    const keyAssetId = (worldSceneData as WorldDataObjectType)?.keyAssetId || credentials.assetId;
    const keyAsset = await getKeyAsset(credentials, keyAssetId, worldSceneData as WorldDataObjectType);

    const lockId = `${keyAssetId}-adminUpdates-${new Date(Math.round(new Date().getTime() / 10000) * 10000)}`;
    await keyAsset.updateDataObject(
      { numberAllowedToCollect, questItemImage },
      { lock: { lockId, releaseLock: true } },
    );

    const droppedAssets = await getQuestItems(credentials);

    if (Object.keys(droppedAssets).length > 0) {
      const promises: Promise<unknown>[] = [];
      for (const droppedAsset of Object.values(droppedAssets) as Array<{
        updateWebImageLayers: (a: string, b: string) => Promise<unknown>;
        updateDataObject: (p: unknown) => Promise<unknown>;
      }>) {
        promises.push(droppedAsset.updateWebImageLayers("", questItemImage));
        promises.push(droppedAsset.updateDataObject({ questItemImage }));
      }
      await Promise.all(promises);
    }

    await keyAsset.fetchDataObject();
    const keyData = (keyAsset.dataObject as KeyAssetDataObjectType) || {};

    // Preserve the response shape the client already consumes
    // (`questDetails.keyAssetId / numberAllowedToCollect / questItemImage`).
    return res.json({
      questDetails: {
        keyAssetId,
        numberAllowedToCollect: keyData.numberAllowedToCollect,
        questItemImage: keyData.questItemImage,
      },
    });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleUpdateAdminSettings",
      message: "Error updating admin settings",
      req,
      res,
    });
  }
};
