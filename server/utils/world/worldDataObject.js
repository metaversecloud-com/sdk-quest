import { World } from "../topiaInit.js";
import error from "../errors.js";

export const getWorldDataObject = async (req, res) => {
  try {
    const world = World.create(urlSlug, { credentials: req.query });
    await world.fetchDataObject();
    res.json({ world, success: true });
  } catch (error) {
    error("Error getting world details", error, res);
  }
};

export const updateWorldDataObject = async (req, res) => {
  const { dataObject } = req.body;
  try {
    const world = World.create(urlSlug, { credentials: req.query });
    await world.updateDataObject(dataObject);
    if (res) res.json({ world, success: true });
    return world;
  } catch (e) {
    error("Updating world data object", e, res);
  }
};
