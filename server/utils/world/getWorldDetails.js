import { World } from "../topiaInit.js";
import { errorHandler } from "../errorHandler.js";
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
  } catch (error) {
    errorHandler({ error, functionName: "getWorldDetails", message: "Error getting world details" });
  }
};
