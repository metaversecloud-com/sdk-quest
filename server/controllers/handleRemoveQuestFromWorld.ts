import { Request, Response } from "express";
import {
  DroppedAsset,
  errorHandler,
  getCredentials,
  getWorldDetails,
  removeQuestItems,
  Visitor,
} from "../utils/index.js";
import { AxiosError } from "axios";

export const handleRemoveQuestFromWorld = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { assetId, urlSlug, visitorId } = credentials;
    const sceneDropId = credentials.sceneDropId || assetId;

    // remove all quest items
    const removeQuestItemsResponse = await removeQuestItems(credentials);
    if (removeQuestItemsResponse instanceof Error) throw removeQuestItemsResponse;

    // remove data from world data object
    const getWorldDetailsResponse = await getWorldDetails(credentials, false);
    if (getWorldDetailsResponse instanceof Error) throw getWorldDetailsResponse;

    const { world } = getWorldDetailsResponse;

    await world.updateDataObject(
      {
        [`scenes.${sceneDropId}`]: `Removed from world on ${new Date()}`,
      },
      {
        lock: {
          lockId: `${urlSlug}-${sceneDropId}-remove-${new Date(Math.round(new Date().getTime() / 60000) * 60000)}`,
        },
      },
    );

    // close drawer and fire toast
    const visitor = await Visitor.create(visitorId, urlSlug, { credentials });
    visitor.closeIframe(assetId).catch((error: AxiosError) =>
      errorHandler({
        error,
        functionName: "handleRemoveQuestFromWorld",
        message: "Error closing iframe",
      }),
    );

    visitor
      .fireToast({
        groupId: "RemoveQuest",
        title: "Quest Successfully Removed",
        text: "You have successfully removed this Quest from your world.",
      })
      .catch((error) =>
        errorHandler({
          error,
          functionName: "handleRemoveQuestFromWorld",
          message: "Error firing toast",
        }),
      );

    // remove key asset
    const droppedAsset = await DroppedAsset.create(assetId, urlSlug, { credentials });
    await droppedAsset.deleteDroppedAsset();

    return res.json({ success: true });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleRemoveQuestFromWorld",
      message: "Error remove Quest from world.",
      req,
      res,
    });
  }
};
