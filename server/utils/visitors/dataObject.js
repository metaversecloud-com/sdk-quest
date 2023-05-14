import { getVisitor } from "./visitor.js";
import error from "../errors.js";

// Should do this if going to want to use the User class to retrieve data object by profileId.
// Need to create an initial entry inside of the Visitor data object before the data object can be accessed via User class.
export const updateLastVisited = async (req, res) => {
  try {
    const visitor = await getVisitor(req);
    await visitor.updateVisitorDataObject({ lastVisited: Date.now() });
    if (res) res.json({ visitor, success: true });
    return visitor;
  } catch (e) {
    error("Updating last visited", e, res);
  }
};

export const updateVisitorDataObject = async (req, res) => {
  const { dataObject } = req.body;
  try {
    const visitor = await getVisitor(req);
    await visitor.updateDataObject(dataObject);
    if (res) res.json({ visitor, success: true });
    return visitor;
  } catch (e) {
    error("Updating visitor data object", e, res);
  }
};

export const incrementVisitorDataObjectValue = async (req, res) => {
  const { path, amount } = req.body;
  try {
    const visitor = await getVisitor(req);
    // Can also pass in a lock object as third argument of type
    // { lockId: string, releaseLock?: boolean }
    await visitor.incrementDataObjectValue(path, amount);
    if (res) res.json({ visitor, success: true });
    return visitor;
  } catch (e) {
    error("Incrementing visitor data object", e, res);
  }
};
