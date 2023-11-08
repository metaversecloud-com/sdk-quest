import { error, getVisitor } from "../utils/index.js";

export const handleGetVisitor = async (req, res) => {
  const { interactivePublicKey, interactiveNonce, urlSlug, visitorId } = req.query;
  const { includeDataObject } = req.body;
  try {
    const visitor = await getVisitor({
      credentials: {
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
      includeDataObject,
      urlSlug,
      visitorId,
    });
    res.json({ visitor, success: true });
  } catch (e) {
    error("Error getting visitor", e, res);
  }
};
