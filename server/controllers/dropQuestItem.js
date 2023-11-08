import {
  dropAsset,
  error,
  getBaseURL,
  getDroppedAssetDetails,
  getKeyAssetImage,
  getRandomCoordinates,
  getWorldDetails,
} from "../utils/index.js";

export const dropQuestItem = async (req, res) => {
  try {
    const { assetId, interactiveNonce, interactivePublicKey, urlSlug, visitorId } = req.query;
    const { uniqueName } = req.body;

    const [questItem, world] = await Promise.all([
      getDroppedAssetDetails({
        credentials: {
          assetId,
          interactiveNonce,
          interactivePublicKey,
          visitorId,
        },
        droppedAssetId: assetId,
        includeDataObject: true,
        urlSlug,
      }),
      getWorldDetails({
        credentials: {
          interactiveNonce,
          interactivePublicKey,
          visitorId,
        },
        includeDataObject: true,
        urlSlug,
      }),
    ]);

    // Randomly place the quest item asset
    const position = getRandomCoordinates(world.width, world.height);
    const layers = { bottom: "", top: getKeyAssetImage(urlSlug) };

    // Check if world already has an key asset image set and make new quest item images match
    const worldKeyAssetDetails = world?.dataObject?.keyAssetDetails || world.dataObject.eggDetails;
    if (worldKeyAssetDetails) {
      layers.bottom = worldKeyAssetDetails.bottomLayer;
      layers.top = worldKeyAssetDetails.topLayer;
    } else if (!worldKeyAssetDetails || !worldKeyAssetDetails.topLayer) {
      // If key asset image not set in world data object update with data from keyAsset
      const questItemDetails = questItem?.dataObject?.keyAssetDetails || questItem?.dataObject?.eggDetails;
      if (questItemDetails) {
        if (questItemDetails.bottomLayer) layers.bottom = questItemDetails.bottomLayer;
        if (questItemDetails.topLayer) layers.top = questItemDetails.topLayer;
      }
      const lockId = `${urlSlug}-keyAssetDetails-${new Date(Math.round(new Date().getTime() / 60000) * 60000)}`;
      world.updateDataObject(
        {
          keyAssetDetails: {
            bottomLayer: layers.bottom,
            topLayer: layers.top,
          },
        },
        { lock: { lockId } },
      );
    }

    const droppedAsset = await dropAsset({
      assetId: questItem.assetId,
      credentials: {
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
      position,
      uniqueName,
      urlSlug,
    });

    await Promise.all([
      droppedAsset.updateClickType({
        clickType: "link",
        clickableLinkTitle: "Quest",
        isOpenLinkInDrawer: true,
        clickableLink: getBaseURL(req) + "/quest-item-clicked/" + `?lastMoved=${new Date().valueOf()}`,
      }),
      droppedAsset.updateWebImageLayers(layers.bottom, layers.top),
    ]);

    res.json({ droppedAsset, success: true });
  } catch (e) {
    error("Error dropping asset", e, res);
  }
};
