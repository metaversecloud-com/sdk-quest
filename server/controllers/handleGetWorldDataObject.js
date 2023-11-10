import { error, getWorldDataObject } from "../utils/index.js";

export const handleGetWorldDataObject = async (req, res) => {
  try {
    const { interactiveNonce, interactivePublicKey, urlSlug, visitorId } = req.query;

    const world = await getWorldDataObject({ interactiveNonce, interactivePublicKey, urlSlug, visitorId }, urlSlug);

    res.json({ world });
  } catch (e) {
    error("Error updating world data object", e, res);
  }
};
