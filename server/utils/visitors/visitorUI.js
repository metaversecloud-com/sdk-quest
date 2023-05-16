import { getVisitor } from "./visitor.js";
import error from "../errors.js";

export const openIframe = async (req, res) => {
  try {
    const { link, shouldOpenInDrawer, title } = req.body;
    const visitor = await getVisitor(req);
    if (!visitor) throw "No visitor found";
    if (visitor.error) throw visitor.error;
    await visitor.openIframe({ link, shouldOpenInDrawer, title });
    if (res) res.json({ visitor, success: true });
    return visitor;
  } catch (e) {
    error("Opening iFrame in visitor UI", e, res);
  }
};

export const fireToast = async (req, res) => {
  try {
    const { groupId, title, text } = req.body;
    const visitor = await getVisitor(req);
    if (!visitor) throw "No visitor found";
    if (visitor.error) throw visitor.error;
    await visitor.fireToast({ groupId, title, text });
    if (res) res.json({ visitor, success: true });
    return visitor;
  } catch (e) {
    error("Firing toast in visitor UI", e, res);
  }
};

export const moveVisitor = async (req, res) => {
  try {
    const {
      moveTo, // { x, y }
      shouldTeleportVisitor,
    } = req.body;
    const visitor = await getVisitor(req);
    if (!visitor) throw "No visitor found";
    if (visitor.error) throw visitor.error;
    if (!moveTo || !moveTo.x || !moveTo.y) throw "Invalid movement coordinates";
    await visitor.moveVisitor({ x: moveTo.x, y: moveTo.y, shouldTeleportVisitor });
    if (res) res.json({ visitor, success: true });
    return visitor;
  } catch (e) {
    error("Moving visitor", e, res);
  }
};
