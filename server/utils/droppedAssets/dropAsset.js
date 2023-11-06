import { Asset, DroppedAsset } from "../topiaInit.js";
import error from "../errors.js";

export const dropWebImageAsset = async (req, res) => {
  const { layers } = req.body;
  try {
    const modReq = { ...req, body: { ...req.body, id: "webImageAsset" } };
    const droppedAsset = await dropAsset(modReq);
    if (droppedAsset) await droppedAsset.updateWebImageLayers(layers.bottom || "", layers.top || "");
    else throw "Error dropping the asset";
    if (res) res.json({ droppedAsset, success: true });
    return droppedAsset;
  } catch (e) {
    error("Dropping web image asset", e, res);
  }
};

export const dropAsset = async (req, res) => {
  const { urlSlug } = req.query;
  const { id, isInteractive, position, uniqueName } = req.body;

  try {
    const droppedAsset = await createAsset({
      id,
      isInteractive, // Makes it so interactive credentials are passed into iFrame and/or webhook payloads.
      req,
      position: {
        x: position.x || 0,
        y: position.y || 0,
      },
      uniqueName,
      urlSlug,
    });
    if (res) res.json({ droppedAsset, success: true });
    return droppedAsset;
  } catch (e) {
    error("Error dropping asset", e, res);
    return null;
  }
};

export const createAsset = async ({ id, isInteractive, req, position, uniqueName }) => {
  try {
    const { interactivePublicKey, interactiveNonce, urlSlug, visitorId } = req.query;

    const asset = Asset.create(id, {
      credentials: {
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
    });

    const droppedAsset = await DroppedAsset.drop(asset, {
      position,
      uniqueName,
      urlSlug,
    });

    // console.log(droppedAsset);
    // // This adds your public developer key to the dropped asset so visitors can interact with it in-world.
    if (droppedAsset && isInteractive)
      await droppedAsset.setInteractiveSettings({
        isInteractive: true,
        interactivePublicKey: process.env.INTERACTIVE_KEY,
      });
    return droppedAsset;
  } catch (e) {
    error("Creating asset", e);
  }
};
