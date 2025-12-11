import { Request, Response } from "express";
import { errorHandler, getCredentials, getQuestItems, getWorldDetails } from "../utils/index.js";

export const handleUpdateAdminSettings = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const sceneDropId = credentials.sceneDropId || credentials.assetId;
    const { numberAllowedToCollect, questItemImage } = req.body;

    if (!questItemImage) throw "questItemImage is required";

    const getWorldDetailsResponse = await getWorldDetails(credentials, false);
    if (getWorldDetailsResponse instanceof Error) throw getWorldDetailsResponse;

    const { world } = getWorldDetailsResponse;

    const lockId = `${sceneDropId}-adminUpdates-${new Date(Math.round(new Date().getTime() / 10000) * 10000)}`;
    await world.updateDataObject(
      {
        [`scenes.${sceneDropId}.numberAllowedToCollect`]: numberAllowedToCollect,
        [`scenes.${sceneDropId}.questItemImage`]: questItemImage,
      },
      { lock: { lockId, releaseLock: true } },
    );

    const getQuestItemsResponse = await getQuestItems(credentials);
    if (getQuestItemsResponse instanceof Error) throw getQuestItemsResponse;

    const droppedAssets = getQuestItemsResponse;

    if (Object.keys(droppedAssets).length > 0) {
      const promises: any[] = [];
      Object.values(droppedAssets).map((droppedAsset: any) => {
        promises.push(droppedAsset.updateWebImageLayers("", questItemImage));
        promises.push(droppedAsset.updateDataObject({ questItemImage }));
      });
      await Promise.all(promises);
    }

    await world.fetchDataObject();

    return res.json({ questDetails: world.dataObject?.scenes?.[sceneDropId] });
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
