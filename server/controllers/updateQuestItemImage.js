import { error, getDroppedAssetsWithUniqueName, getWorldDataObject } from "../utils/index.js";

export const updateQuestItemImage = async (req, res) => {
  try {
    const { interactiveNonce, interactivePublicKey, urlSlug, visitorId } = req.query;
    const { questItemImage } = req.body;

    const world = await getWorldDataObject({ interactiveNonce, interactivePublicKey, urlSlug, visitorId }, urlSlug);

    if (world.dataObject?.questItemImage !== questItemImage) {
      const lockId = `${urlSlug}-questItemImage-${new Date(Math.round(new Date().getTime() / 10000) * 10000)}`;
      world.updateDataObject({ questItemImage }, { lock: { lockId } });

      if (world.dataObject?.keyAssetId) {
        const droppedAssets = await getDroppedAssetsWithUniqueName({
          credentials: {
            interactiveNonce,
            interactivePublicKey,
            visitorId,
          },
          isPartial: true,
          uniqueName: world.dataObject?.keyAssetId,
          urlSlug,
        });

        const promises = droppedAssets.map((droppedAsset) => droppedAsset.updateWebImageLayers("", questItemImage));
        await Promise.all(promises);
      }
    }

    return res.json({ success: true });
  } catch (e) {
    error("Error updating quest items", e, res);
  }
};
