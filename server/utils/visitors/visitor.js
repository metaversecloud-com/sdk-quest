import { Visitor } from "../topiaInit.js";
import error from "../errors.js";

export const getVisitor = async (req, res) => {
  const { assetId, interactivePublicKey, interactiveNonce, urlSlug, visitorId } = req.query;
  const { includeDataObject } = req.body;
  try {
    const visitor = await Visitor.get(visitorId, urlSlug, {
      credentials: {
        assetId,
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
    });
    if (!visitor || !visitor.username) throw "Not in world";
    if (includeDataObject) await visitor.fetchDataObject();
    if (res) res.json({ visitor, success: true });
    return visitor;
  } catch (e) {
    error("Error getting visitor", e, res);
  }
};
