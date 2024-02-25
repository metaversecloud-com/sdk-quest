import { Visitor } from "../utils/topiaInit.js";
import { errorHandler } from "../utils/index.js";

export const handleMoveVisitor = async (req, res) => {
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

    return res.json({ visitor, success: true });
  } catch (error) {
    return errorHandler({ error, functionName: "handleMoveVisitor", message: "Error moving visitor", req, res });
  }
};
