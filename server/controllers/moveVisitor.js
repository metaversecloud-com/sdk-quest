import { error, getVisitor } from "../utils/index.js";

export const moveVisitor = async (req, res) => {
  const { interactivePublicKey, interactiveNonce, urlSlug, visitorId } = req.query;
  try {
    const {
      moveTo, // { x, y }
      shouldTeleportVisitor,
    } = req.body;
    const visitor = await getVisitor({
      credentials: {
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
      includeDataObject: false,
      urlSlug,
      visitorId,
    });
    if (!moveTo || !moveTo.x || !moveTo.y) throw "Invalid movement coordinates";
    await visitor.moveVisitor({ x: moveTo.x, y: moveTo.y, shouldTeleportVisitor });
    res.json({ visitor, success: true });
    return visitor;
  } catch (e) {
    error("Moving visitor", e, res);
  }
};
