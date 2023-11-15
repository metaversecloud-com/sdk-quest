import { error, getVisitor } from "../utils/index.js";

export const handleGetVisitor = async (req, res) => {
  try {
    const { interactivePublicKey, interactiveNonce, urlSlug, visitorId } = req.query;
    const visitor = await getVisitor({
      credentials: {
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
      urlSlug,
      visitorId,
    });
    return res.json({ visitor, success: true });
  } catch (e) {
    error("Error getting visitor", e, res);
  }
};
