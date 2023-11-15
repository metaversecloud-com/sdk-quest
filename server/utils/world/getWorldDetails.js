import { World } from "../topiaInit.js";
import { error } from "../error.js";

export const getWorldDetails = async ({ credentials, urlSlug }) => {
  try {
    const world = World.create(urlSlug, {
      credentials,
    });
    await world.fetchDetails();
    await world.fetchDataObject();
    if (!world.dataObject) {
      const lockId = `${urlSlug}-itemsCollectedByUser-${new Date(Math.round(new Date().getTime() / 60000) * 60000)}`;
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
