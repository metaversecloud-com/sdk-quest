import { Asset, DroppedAsset } from "../topiaInit.js";
import error from "../errors.js";

export const dropAsset = async (req, res) => {
  const { urlSlug } = req.query;
  const { id, isInteractive, position, uniqueName } = req.body;

  try {
    const droppedAsset = await createAsset({
      id,
      isInteractive,
      req,
      position: {
        x: position ? position.x : 0,
        y: position ? position.y + 42 : 42,
      },
      uniqueName,
      urlSlug,
    });
    if (res) res.json({ droppedAsset, success: true });
    return droppedAsset;
  } catch (e) {
    error("Error dropping asset", e, res);
  }
};

export const createAsset = async ({ id, isInteractive, req, position, uniqueName }) => {
  try {
    const { assetId, interactivePublicKey, interactiveNonce, urlSlug, visitorId } = req.query;

    const asset = Asset.create(id, {
      credentials: {
        assetId,
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

    // This adds your public developer key to the dropped asset so visitors can interact with it in-world.
    if (droppedAsset && isInteractive)
      await droppedAsset.setInteractiveSettings({
        isInteractive: true,
        interactivePublicKey: process.env.INTERACTIVE_KEY,
      });
    return droppedAsset;
  } catch (e) {
    error("Creating asset", e, res);
  }
};
