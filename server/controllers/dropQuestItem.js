import {
  dropAsset,
  errorHandler,
  getBaseURL,
  getDroppedAssetDetails,
  getDefaultKeyAssetImage,
  getRandomCoordinates,
  getWorldDetails,
} from "../utils/index.js";

export const dropQuestItem = async (req, res) => {
  try {
    const { assetId, interactiveNonce, interactivePublicKey, urlSlug, visitorId } = req.query;

    const [questItem, world] = await Promise.all([
      getDroppedAssetDetails({
        credentials: {
          assetId,
          interactiveNonce,
          interactivePublicKey,
          visitorId,
        },
        droppedAssetId: assetId,
        urlSlug,
      }),
      getWorldDetails({
        assetId,
        credentials: {
          interactiveNonce,
          interactivePublicKey,
          visitorId,
        },
        urlSlug,
      }),
    ]);

    // Randomly place the quest item asset
    const position = getRandomCoordinates(world.width, world.height);

    const droppedAsset = await dropAsset({
      assetId: questItem.assetId,
      credentials: {
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
      position,
      uniqueName: assetId,
      urlSlug,
    });

    // Use questItemImage from world data object or fallback to default
    const questItemImage =
      world.dataObject?.keyAssets?.[assetId]?.questItemImage ||
      droppedAsset.layer1 ||
      getDefaultKeyAssetImage({ urlSlug });

    await Promise.all([
      droppedAsset.updateClickType({
        clickType: "link",
        clickableLinkTitle: "Quest",
        isOpenLinkInDrawer: true,
        clickableLink: getBaseURL(req) + "/quest-item-clicked/" + `?lastMoved=${new Date().valueOf()}`,
      }),
      droppedAsset.updateWebImageLayers("", questItemImage),
      world.updateDataObject({ [`keyAssets.${assetId}.questItems.${droppedAsset.id}.count`]: 0 }),
    ]);

    return res.json({ droppedAsset, success: true });
  } catch (error) {
    errorHandler({
      error,
      functionName: "dropQuestItem",
      message: "Error dropping asset",
      req,
      res,
    });
  }
};
