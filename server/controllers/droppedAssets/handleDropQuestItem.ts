import { Request, Response } from "express";
import { WorldDataObjectType } from "../../types/DataObjectTypes.js";
import {
  Asset,
  DroppedAsset,
  errorHandler,
  getBaseURL,
  getRandomCoordinates,
  getWorldDetails,
  getCredentials,
} from "../../utils/index.js";

export const handleDropQuestItem = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { interactivePublicKey, urlSlug } = credentials;
    const sceneDropId = credentials.sceneDropId || credentials.assetId;

    const { dataObject, world } = await getWorldDetails(credentials, true);
    const { questItemImage } = dataObject as WorldDataObjectType;
    if (!questItemImage) throw "questItemImage is required";

    // Randomly place the quest item asset
    const position = getRandomCoordinates(world.width, world.height);

    const asset = Asset.create(process.env.WEB_IMAGE_ASSET_ID || "webImageAsset", {
      credentials,
    });

    const droppedAsset = await DroppedAsset.drop(asset, {
      interactivePublicKey,
      isInteractive: true,
      layer0: "",
      layer1: questItemImage,
      position,
      sceneDropId,
      uniqueName: `questItem_${sceneDropId}`,
      urlSlug,
    });

    await droppedAsset.updateClickType({
      // @ts-ignore
      clickType: "link",
      clickableLinkTitle: "Quest",
      isOpenLinkInDrawer: true,
      clickableLink: getBaseURL(req) + "/quest-item-clicked/" + `?lastMoved=${new Date().valueOf()}`,
    });

    return res.json({ droppedAsset });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleDropQuestItem",
      message: "Error dropping asset",
      req,
      res,
    });
  }
};
