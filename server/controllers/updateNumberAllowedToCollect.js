import { error, getWorldDataObject } from "../utils/index.js";

export const updateNumberAllowedToCollect = async (req, res) => {
  try {
    const { interactiveNonce, interactivePublicKey, urlSlug, visitorId } = req.query;
    const { numberAllowedToCollect } = req.body;

    const world = await getWorldDataObject({ interactiveNonce, interactivePublicKey, urlSlug, visitorId }, urlSlug);

    if (world.dataObject?.numberAllowedToCollect !== numberAllowedToCollect) {
      const lockId = `${urlSlug}-numberAllowedToCollect-${new Date(Math.round(new Date().getTime() / 60000) * 60000)}`;
      world.updateDataObject({ numberAllowedToCollect }, { lock: { lockId } });
    }

    res.json({ success: true });
  } catch (e) {
    error("Error updating world data object", e, res);
  }
};