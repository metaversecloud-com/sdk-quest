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
    const credentials = {
      assetId,
      interactiveNonce,
      interactivePublicKey,
      urlSlug,
      visitorId,
    };

    const [keyAsset, world] = await Promise.all([
      getDroppedAssetDetails({
        credentials,
        droppedAssetId: assetId,
      }),
      getWorldDetails({
        credentials,
        urlSlug,
      }),
    ]);

    // Randomly place the quest item asset
    const position = getRandomCoordinates(world.width, world.height);

    const droppedAsset = await dropAsset({
      assetId: keyAsset.assetId,
      credentials,
      position,
      sceneId: `${assetId}_${keyAsset.uniqueName}`,
      uniqueName: `questItem_${keyAsset.uniqueName}`,
      urlSlug,
    });

    // Use questItemImage from key asset data object or fallback to default
    const questItemImage = keyAsset.dataObject?.questItemImage || getDefaultKeyAssetImage({ urlSlug });

    await Promise.all([
      droppedAsset.updateClickType({
        clickType: "link",
        clickableLinkTitle: "Quest",
        isOpenLinkInDrawer: true,
        clickableLink: getBaseURL(req) + "/quest-item-clicked/" + `?lastMoved=${new Date().valueOf()}`,
      }),
      droppedAsset.updateWebImageLayers("", questItemImage),
      droppedAsset.setDataObject({ keyAssetId: keyAsset.id, keyAssetUniqueName: keyAsset.uniqueName }),
      world.updateDataObject({ [`keyAssets.${assetId}.questItems.${droppedAsset.id}.count`]: 0 }),
    ]);

    return res.json({ droppedAsset, success: true });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "dropQuestItem",
      message: "Error dropping asset",
      req,
      res,
    });
  }
};
