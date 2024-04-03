import { Request, Response } from "express";
import { DroppedAsset, errorHandler, getCredentials } from "../../utils/index.js";

export const handleRemoveDroppedAsset = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { urlSlug } = credentials;
    const { droppedAssetId } = req.params;

    const droppedAsset = DroppedAsset.create(droppedAssetId, urlSlug, { credentials });
    await droppedAsset.deleteDroppedAsset();

    return res.json({ success: true });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleRemoveDroppedAsset",
      message: "Error removing dropped asset",
      req,
      res,
    });
  }
};
