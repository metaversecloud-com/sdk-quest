import { World } from "../topiaInit.js";
import { error } from "../error.js";

export const getWorldDetails = async ({ credentials, includeDataObject, urlSlug }) => {
  try {
    const world = World.create(urlSlug, {
      credentials,
    });
    await world.fetchDetails();
    if (includeDataObject) await world.fetchDataObject();
    return world;
  } catch (e) {
    error("Error getting world details", e);
  }
};
