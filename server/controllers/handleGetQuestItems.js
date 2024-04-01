import { errorHandler, getCredentials, getDroppedAssetsWithUniqueName } from "../utils/index.js";

export const handleGetQuestItems = async (req, res) => {
  try {
    const credentials = getCredentials(req.query);
    const { assetId } = credentials;

    const droppedAssets = await getDroppedAssetsWithUniqueName({
      assetId,
      credentials,
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
