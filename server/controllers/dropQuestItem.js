import {
  dropAsset,
  error,
  getBaseURL,
  getDroppedAssetDetails,
  getDefaultKeyAssetImage,
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
    // Use questItemImage from world data object or fallback to default
    const questItemImage = world?.dataObject?.questItemImage || getDefaultKeyAssetImage(urlSlug);

    const droppedAsset = await dropAsset({
      assetId: questItem.assetId,
      credentials: {
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
      position,
      uniqueName: `${assetId}-${uniqueName}`,
      urlSlug,
    });

    await Promise.all([
      droppedAsset.updateClickType({
        clickType: "link",
        clickableLinkTitle: "Quest",
        isOpenLinkInDrawer: true,
        clickableLink: getBaseURL(req) + "/quest-item-clicked/" + `?lastMoved=${new Date().valueOf()}`,
      }),
      droppedAsset.updateWebImageLayers("", questItemImage),
    ]);

    return res.json({ droppedAsset, success: true });
  } catch (e) {
    error("Error dropping asset", e, res);
  }
};
