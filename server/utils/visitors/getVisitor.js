import { Visitor } from "../topiaInit.js";
import { error } from "../error.js";

export const getVisitor = async ({ assetId, credentials, includeDataObject, urlSlug, visitorId }) => {
  try {
    const visitor = await Visitor.get(visitorId, urlSlug, { credentials });
    if (!visitor || !visitor.username) throw "Not in world";
    if (includeDataObject) {
      await visitor.fetchDataObject();
      if (!visitor.dataObject) {
        console.log("no data object");
        const lockId = `${visitorId}-${assetId}-itemsCollectedByWorld-${new Date(
          Math.round(new Date().getTime() / 60000) * 60000,
        )}`;
        await visitor.setDataObject(
          {
            itemsCollectedByWorld: {},
          },
          { lock: { lockId } },
        );
      }
    }
    return visitor;
  } catch (e) {
    error("Error getting visitor", e);
  }
};
