import { World } from "../topiaInit.js";
import { error } from "../error.js";

export const getWorldDataObject = async (credentials, urlSlug) => {
  try {
    const world = World.create(urlSlug, { credentials });
    await world.fetchDataObject();
    if (!world.dataObject) {
      console.log("no data object");
      const lockId = `${urlSlug}-${assetId}-itemsCollectedByUser-${new Date(
        Math.round(new Date().getTime() / 60000) * 60000,
      )}`;
      await world.setDataObject(
        {
          itemsCollectedByUser: {},
          profileMapper: {},
        },
        { lock: { lockId } },
      );
    }
    return world;
  } catch (e) {
    error("Error getting world details", e);
  }
};
