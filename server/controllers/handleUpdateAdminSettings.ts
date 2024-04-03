import { Request, Response } from "express";
import { errorHandler, getCredentials, getDroppedAssetDetails, World } from "../utils/index.js";

export const handleUpdateAdminSettings = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { assetId, urlSlug } = credentials;
    const { numberAllowedToCollect, questItemImage } = req.body;

    const droppedAsset = await getDroppedAssetDetails({
      credentials,
      droppedAssetId: assetId,
    });

    const lockId = `${assetId}-adminUpdates-${new Date(Math.round(new Date().getTime() / 10000) * 10000)}`;
    await droppedAsset.updateDataObject(
      { numberAllowedToCollect, questItemImage },
      { lock: { lockId, releaseLock: true } },
    );

    const uniqueName = droppedAsset.uniqueName || "Quest"
    const world = await World.create(urlSlug, { credentials });
    const droppedAssets = await world.fetchDroppedAssetsBySceneDropId({
      sceneDropId: `${assetId}_${uniqueName}`,
    })
    if (droppedAssets.length > 0) {
      const promises: any[] = []
      droppedAssets.map((droppedAsset) => {
        // @ts-ignore
        if (droppedAsset.uniqueName === `questItem_${uniqueName}`) {
          promises.push(droppedAsset.updateWebImageLayers("", questItemImage));
          promises.push(droppedAsset.updateDataObject({ questItemImage }));
        }
      });
      await Promise.all(promises);
    }

    return res.json({ success: true });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleUpdateAdminSettings",
      message: "Error updating quest items",
      req,
      res,
    });
  }
};
