import { Visitor } from "../topiaInit.js";
import { errorHandler } from "../errorHandler.js";

export const getVisitor = async ({ credentials, urlSlug, visitorId }) => {
  try {
    const visitor = await Visitor.get(visitorId, urlSlug, { credentials });
    if (!visitor || !visitor.username) throw "Not in world";
    await visitor.fetchDataObject();

    if (!visitor.dataObject || !visitor.dataObject?.itemsCollectedByWorld) {
      const lockId = `${visitorId}-itemsCollectedByWorld-${new Date(Math.round(new Date().getTime() / 60000) * 60000)}`;
      await visitor.setDataObject(
        {
          itemsCollectedByWorld: { [urlSlug]: { count: 0 } },
        },
        { lock: { lockId } },
      );
    }
    return visitor;
  } catch (error) {
    return errorHandler({ error, functionName: "getVisitor", message: "Error getting visitor" });
    return await visitor.fetchDataObject();
  }
};
