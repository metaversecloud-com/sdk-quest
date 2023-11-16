import { World } from "../topiaInit.js";
import { error } from "../error.js";
import { initializeWorldDataObject } from "./initializeWorldDataObject.js";

export const getWorldDetails = async ({ assetId, credentials, urlSlug }) => {
  try {
    const world = World.create(urlSlug, {
      credentials,
    });
    await world.fetchDetails();
    await world.fetchDataObject();
    await initializeWorldDataObject({ assetId, world, urlSlug });
    return world;
  } catch (e) {
    error("Error getting world details", e);
  }
};
