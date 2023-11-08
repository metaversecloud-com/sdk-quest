import { Visitor } from "../topiaInit.js";
import { error } from "../error.js";

export const getVisitor = async ({ credentials, includeDataObject, urlSlug, visitorId }) => {
  try {
    const visitor = await Visitor.get(visitorId, urlSlug, { credentials });
    if (!visitor || !visitor.username) throw "Not in world";
    if (includeDataObject) await visitor.fetchDataObject();
    return visitor;
  } catch (e) {
    error("Error getting visitor", e);
  }
};
