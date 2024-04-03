import { Request, Response } from "express";
import { errorHandler, getCredentials, getDroppedAssetDataObject } from "../../utils/index.js";

export const handleGetDroppedAssetDataObject = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const droppedAsset = await getDroppedAssetDataObject(credentials);
    return res.json({ droppedAsset });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleGetDroppedAssetDataObject",
      message: "Error updating dropped asset data object",
      req,
      res,
    });
  }
};
