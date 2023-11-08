import { World } from "../topiaInit.js";
import { error } from "../error.js";

export const getWorldDataObject = async (credentials, urlSlug) => {
  try {
    const world = World.create(urlSlug, { credentials });
    await world.fetchDataObject();
    return world.dataObject;
  } catch (e) {
    error("Error getting world details", e);
  }
};
