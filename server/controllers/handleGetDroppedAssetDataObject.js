import { errorHandler, getDroppedAssetDataObject } from "../utils/index.js";

export const handleGetDroppedAssetDataObject = async (req, res) => {
  try {
    const { assetId, interactiveNonce, interactivePublicKey, urlSlug, visitorId } = req.query;
    const droppedAsset = await getDroppedAssetDataObject({
      credentials: {
        assetId,
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
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
