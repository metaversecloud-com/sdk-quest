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
        urlSlug,
      }),
      getWorldDetails({
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
    // Use questItemImage from world data object or fallback to default
    const questItemImage = world?.dataObject?.questItemImage || getDefaultKeyAssetImage(urlSlug);
    console.log("🚀 ~ file: dropQuestItem.js:41 ~ dropQuestItem ~ world?.dataObject:", world?.dataObject);
    console.log("🚀 ~ file: dropQuestItem.js:41 ~ dropQuestItem ~ questItemImage:", questItemImage);

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

    const [test1, test2] = await Promise.all([
      droppedAsset.updateClickType({
        clickType: "link",
        clickableLinkTitle: "Quest",
        isOpenLinkInDrawer: true,
        clickableLink: getBaseURL(req) + "/quest-item-clicked/" + `?lastMoved=${new Date().valueOf()}`,
      }),
      droppedAsset.updateWebImageLayers("", questItemImage),
    ]);
    console.log("🚀 ~ file: dropQuestItem.js:65 ~ dropQuestItem ~ test1:", test1);
    console.log("🚀 ~ file: dropQuestItem.js:57 ~ dropQuestItem ~ test2:", test2);

    return res.json({ droppedAsset, success: true });
  } catch (e) {
    error("Error dropping asset", e, res);
  }
};
