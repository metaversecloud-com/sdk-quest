import { World } from "../topiaInit.js";
import { errorHandler } from "../errorHandler.js";
import { initializeWorldDataObject } from "./initializeWorldDataObject.js";
import { Credentials } from '../../types/Credentials';

export const getWorldDetails = async (credentials: Credentials) => {
  try {
    const { urlSlug } = credentials
    const world = World.create(urlSlug, { credentials });
    await world.fetchDetails();
    await world.fetchDataObject();
    await initializeWorldDataObject({ credentials, world, urlSlug });
    return world;
  } catch (error) {
    return errorHandler({ error, functionName: "getWorldDetails", message: "Error getting world details" });
  }
};
