import { error, getVisitor } from "../utils/index.js";

export const handleGetVisitor = async (req, res) => {
  try {
    const { assetId, interactivePublicKey, interactiveNonce, urlSlug, visitorId } = req.query;
    const { includeDataObject } = req.body;
    const visitor = await getVisitor({
      assetId,
      credentials: {
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
      includeDataObject,
      urlSlug,
      visitorId,
    });
    return res.json({ visitor, success: true });
  } catch (e) {
    error("Error getting visitor", e, res);
  }
};
