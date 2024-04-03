import { Request, Response } from "express";
import { errorHandler, getDroppedAssetDetails, getCredentials } from "../../utils/index.js";

export const handleGetKeyAssetImage = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { assetId, urlSlug } = credentials;

    const droppedAsset = await getDroppedAssetDetails({
      credentials,
      droppedAssetId: assetId,
      shouldInitDataObject: true,
    });

    return res.json({ keyAssetImage: droppedAsset.dataObject?.questItemImage, success: true });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleGetKeyAssetImage",
      message: "Error getting key asset image",
      req,
      res,
    });
  }
};
