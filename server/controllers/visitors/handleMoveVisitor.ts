import { Request, Response } from "express";
import { errorHandler, getCredentials, Visitor } from "../../utils/index.js";

export const handleMoveVisitor = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { urlSlug, visitorId } = credentials;
    const { moveTo, shouldTeleportVisitor } = req.body;

    if (!moveTo || !moveTo.x || !moveTo.y) throw "Invalid movement coordinates";

    const visitor = Visitor.create(visitorId, urlSlug, { credentials });
    await visitor.moveVisitor({ x: moveTo.x, y: moveTo.y, shouldTeleportVisitor });

    return res.json({ visitor, success: true });
  } catch (error) {
    return errorHandler({ error, functionName: "handleMoveVisitor", message: "Error moving visitor", req, res });
  }
};
