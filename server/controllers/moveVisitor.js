import { Visitor } from "../utils/topiaInit.js";
import { error } from "../utils/index.js";

export const moveVisitor = async (req, res) => {
  try {
    const { interactivePublicKey, interactiveNonce, urlSlug, visitorId } = req.query;
    const { moveTo, shouldTeleportVisitor } = req.body;

    if (!moveTo || !moveTo.x || !moveTo.y) throw "Invalid movement coordinates";

    const visitor = Visitor.create(visitorId, urlSlug, {
      credentials: {
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
    });
    await visitor.moveVisitor({ x: moveTo.x, y: moveTo.y, shouldTeleportVisitor });

    res.json({ visitor, success: true });
    return visitor;
  } catch (e) {
    error("Moving visitor", e, res);
  }
};
