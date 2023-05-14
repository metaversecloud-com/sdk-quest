import { Visitor } from "../topiaInit.js";
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

export const updateVisitorDataObject = async (req, res) => {
  const { dataObject } = req.body;
  try {
    const visitor = await getVisitor(req);
    await visitor.updateDataObject(dataObject);
    if (res) res.json({ visitor, success: true });
    return visitor;
  } catch (e) {
    error("Updating last visited", e, res);
  }
};
