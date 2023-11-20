import { errorHandler, getWorldDataObject } from "../utils/index.js";

export const handleGetWorldDataObject = async (req, res) => {
  try {
    const { assetId, interactiveNonce, interactivePublicKey, urlSlug, visitorId } = req.query;
    const world = await getWorldDataObject({
      credentials: {
        assetId,
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
      urlSlug,
    });
    return res.json({ world });
  } catch (error) {
    errorHandler({
      error,
      functionName: "handleGetWorldDataObject",
      message: "Error updating world data object",
      req,
      res,
    });
  }
};
