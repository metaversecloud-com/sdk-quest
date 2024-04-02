import { errorHandler, getCredentials, getDroppedAssetDataObject } from "../utils/index.js";

export const handleGetDroppedAssetDataObject = async (req, res) => {
  try {
    const credentials = getCredentials(req.query);
    const { urlSlug } = credentials;
    const droppedAsset = await getDroppedAssetDataObject({
      credentials,
      urlSlug,
    });
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
