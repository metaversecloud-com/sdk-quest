import { errorHandler, getDroppedAssetsWithUniqueName } from "../utils/index.js";

export const handleGetQuestItems = async (req, res) => {
  try {
    const { assetId, interactivePublicKey, interactiveNonce, urlSlug, visitorId } = req.query;

    const droppedAssets = await getDroppedAssetsWithUniqueName({
      assetId,
      credentials: {
        interactiveNonce,
        interactivePublicKey,
        visitorId,
        urlSlug,
      },
      isPartial: true,
    });

    return res.json({ droppedAssets, success: true });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleGetQuestItems",
      message: "Error fetching dropped assets with unique name",
      req,
      res,
    });
  }
};
