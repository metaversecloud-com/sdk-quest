import { World } from "../topiaInit.js";
import error from "../errors.js";

export const getWorldDetails = async (req, res) => {
  try {
    const { urlSlug } = req.query;
    const { includeDataObject } = req.body;
    const world = World.create(urlSlug, { credentials: req.query });
    if (includeDataObject) await world.fetchDataObject();
    res.json({ world, success: true });
  } catch (error) {
    error("Error getting world details", error, res);
  }
};
