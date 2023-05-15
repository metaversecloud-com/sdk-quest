import { World } from "../topiaInit.js";
import error from "../errors.js";

export const getWorldDetails = async (req, res) => {
  try {
    const { urlSlug } = req.query;
    const { includeDataObject } = req.body;
    const world = World.create(urlSlug, { credentials: req.query });
    await world.fetchDetails();
    if (includeDataObject) await world.fetchDataObject();
    if (res) res.json({ world, success: true });
    return world;
  } catch (e) {
    error("Error getting world details", e, res);
  }
};

export const updateWorldDetails = async (req, res) => {
  try {
    const { urlSlug } = req.query;
    const { controls, description, forceAuthOnLogin, height, name, spawnPosition, width } = req.body;
    const world = World.create(urlSlug, { credentials: req.query });
    await world.updateDetails({ controls, description, forceAuthOnLogin, height, name, spawnPosition, width });
    if (res) res.json({ world, success: true });
    return;
  } catch (e) {
    error("Error updating world details", e, res);
  }
};
