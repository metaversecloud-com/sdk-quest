import { Request, Response } from "express";
import { errorHandler, getBadges, getCredentials, getKeyAsset, getVisitor, getWorldDetails } from "../../utils/index.js";
import { KeyAssetDataObjectType, WorldDataObjectType } from "../../types/DataObjectTypes.js";

export const handleGetQuestDetails = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const forceRefreshInventory = req.query.forceRefreshInventory === "true";

    const { dataObject: worldSceneData } = await getWorldDetails(credentials, false);
    const worldCfg = (worldSceneData as WorldDataObjectType) || {};
    const keyAssetId = worldCfg.keyAssetId || credentials.assetId;

    const keyAsset = await getKeyAsset(credentials, keyAssetId, worldCfg);
    const keyData = (keyAsset.dataObject as KeyAssetDataObjectType) || {};

    const { visitor, visitorInventory } = await getVisitor(credentials, keyAssetId);

    const badges = await getBadges(credentials, forceRefreshInventory);

    // `questDetails` shape kept intact for the client — fields come from
    // the key asset, with the world's legacy values as the backstop.
    return res.json({
      questDetails: {
        keyAssetId,
        numberAllowedToCollect: keyData.numberAllowedToCollect ?? worldCfg.numberAllowedToCollect,
        questItemImage: keyData.questItemImage ?? worldCfg.questItemImage,
      },
      visitor: { isAdmin: visitor.isAdmin, profileId: credentials.profileId },
      visitorInventory,
      badges,
    });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleGetQuestDetails",
      message: "Error getting quest details image",
      req,
      res,
    });
  }
};
