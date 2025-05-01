import { Request, Response } from "express";
import {
  DroppedAsset,
  errorHandler,
  getCredentials,
  getWorldDetails,
  removeQuestItems,
  Visitor,
} from "../utils/index.js";

export const handleRemoveQuestFromWorld = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { assetId, urlSlug, visitorId } = credentials;
    const sceneDropId = credentials.sceneDropId || assetId;

    // remove all quest items
    const { success } = await removeQuestItems(credentials);
    if (!success) throw "Error removing quest items.";

    // remove data from world data object
    const { world } = await getWorldDetails(credentials, false);
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
    visitor.closeIframe(assetId);

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
